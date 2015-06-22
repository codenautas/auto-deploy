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
var autoDeploy = {};
autoDeploy.childPID = null;

autoDeploy.readVars = function readVars() {
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
        return vars;
    }).catch(function(err) {
        console.log("ERROR", err);
        console.log("STACK", err.stack);
    });
};

//var logFile = "ad.log";
//var fout = fs.openSync(logFile, 'a'), ferr = fs.openSync(logFile, 'a');
var fout=process.stdout, ferr=process.stederr;

function spawnChild(vars) {
    var cargs=vars.server.split(' ');
    var cmd=cargs[0];
    cargs.splice(0, 1);
    var child = spawn(cmd, cargs, {stdio: [ 'ignore', fout, ferr, 'pipe'] });
    autoDeploy.childPID = child.pid;
    child.stdio[3].on('data', autoDeploy.handleCommand);
}

autoDeploy.handleCommand = function handleCommand(msg) {
    Promises.start(function() {
        return autoDeploy.readVars();
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
        return autoDeploy.readVars();
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
        return autoDeploy.readVars();
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

exports = module.exports = autoDeploy;
