/*!
 * auto-deploy
 * 2015 Codenautas
 * GNU Licensed
 */
"use strict";
var Promises = require('best-promise');
var express = require('express');
var fs = require('fs-promise');
var spawn = require("child_process").spawn;
var autoDeploy = {
    childPID: 0,
    fOut: process.stdout,
    fErr: process.stderr
};

autoDeploy.initVars = function initVars() {
    var vars={};
    return Promises.start(function() {
        return fs.readJson('./package.json');
    }).then(function(json){
        var adp=json['auto-deploy'];
        if(!adp) { throw new Error('Missing "auto-deploy" section in package.json');  }
        vars.server = adp['server'];
        if(! vars.server) { throw new Error('Missing "server" section in "auto-deploy" section of package.json'); }
        vars.commands=json['auto-deploy']['commands'];
        if(! vars.commands) { throw new Error('No commands to run for auto-deploy'); }
        if(adp.log) {
            if(adp.logFile) {
                autoDeploy.fOut = fs.openSync(adp.logFile, 'a');
                autoDeploy.fErr = fs.openSync(adp.logFile, 'a');
            } else {
                console.log("Warning: logging is on but logFile is not!");
            }
        }
        return vars;
    }).catch(function(err) {
        console.log("ERROR", err);
        console.log("STACK", err.stack);
    });
};

function spawnChild(vars) {
    var cargs=vars.server.split(' ');
    var cmd=cargs[0];
    cargs.splice(0, 1);
    var child = spawn(cmd, cargs, {stdio: [ 'ignore', autoDeploy.fOut, autoDeploy.fErr, 'pipe'] });
    autoDeploy.childPID = child.pid;
    child.stdio[3].on('data', autoDeploy.handleCommand);
}

autoDeploy.handleCommand = function handleCommand(msg) {
    Promises.start(function() {
        return autoDeploy.initVars();
    }).then(function(vars) {
        var cmd=msg.toString("utf8");
        process.kill(autoDeploy.childPID);
        console.log("Ejecutar "+cmd+"?")
        if(cmd in vars.commands) {
            console.log("Ejecutando", vars.commands[cmd]);
            var restart = true;
            switch(vars.commands[cmd]) {
                case 'nop':
                    break;
                case 'exit':
                    restart = false;
                    break;
            }
            if(restart) {
                console.log("Re-starting server... ["+vars.server+"] PID:", autoDeploy.childPID);
                spawnChild(vars);
            }
        } else { console.log("command not in list: ", cmd); }
    }).catch(function(err) {
        console.log("ERROR", err);
        console.log("STACK", err.stack);
    });
}

autoDeploy.startServer = function startServer() {
    Promises.start(function() {
        return autoDeploy.initVars();
    }).then(function(vars) {
        console.log("Starting server... ["+vars.server+"]");
        spawnChild(vars);
    }).catch(function(err) {
        console.log("ERROR", err);
        console.log("STACK", err.stack);
    });
};

autoDeploy.install = function install(app) {
    return Promises.start(function() {
        return autoDeploy.initVars();
    }).then(function(vars) {
        console.log("Installing auto-deploy...");
        app.adHandler = function(req, res) {
            var laPipa = fs.createWriteStream(null,{fd: 3});
            for(var cmd in vars.commands) {
                if(cmd in req.query) {
                    laPipa.write(cmd);
                    break;
                }
            }
        }
        app.get('/auto-deploy', app.adHandler);
    }).catch(function(err) {
        console.log("ERROR", err);
        console.log("STACK", err.stack);
    });
}

autoDeploy.getLinks = function getLinks() {
    return Promises.start(function() {
        return autoDeploy.initVars();
    }).then(function(vars) {
        var links='';
        for(var cmd in vars.commands) {
            links += '<a href="/auto-deploy?'+ cmd+ '">' + cmd + '</a>|';
        }
        return links.substr(0, links.length-1);
    }).catch(function(err) {
        console.log("ERROR", err);
        console.log("STACK", err.stack);
    });
};

exports = module.exports = autoDeploy;
