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
    fOut: process.stdout,
    fErr: process.stderr,
    child: null
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
        vars.param = adp.param;
        return vars;
    }).catch(function(err) {
        console.log("initVars: ERROR", err, err.stack);
    });
};

function spawnChild(vars) {
    var cargs=vars.server.split(' ');
    var cmd=cargs[0];
    cargs.splice(0, 1);
    autoDeploy.child = spawn(cmd, cargs, {stdio: [ 'ignore', autoDeploy.fOut, autoDeploy.fErr, 'pipe'] });
    autoDeploy.child.stdio[3].on('data', autoDeploy.handleCommand);
}

autoDeploy.handleCommand = function handleCommand(msg) {
    Promises.start(function() {
        return autoDeploy.initVars();
    }).then(function(vars) {
        var cmd=msg.toString("utf8");
        autoDeploy.child.on('exit', function() {
            console.log("child exits");
            if(cmd in vars.commands) {
                var runCmd = vars.commands[cmd];
                console.log("Procesando ", cmd);
                var restart = true;
                switch(runCmd) {
                    case 'nop':
                        break;
                    case 'exit':
                        restart = false;
                        break;
                    default:
                        // procesamos todos los comandos
                        console.log("Ejecutando: ", runCmd)
                }
                if(restart) {
                    spawnChild(vars);
                    console.log("Re-starting server... ["+vars.server+"] PID:", autoDeploy.child.pid);
                }
            } else { console.log("command not in list: ", cmd); }            
        });
        process.kill(autoDeploy.child.pid);
    }).catch(function(err) {
        console.log("handleCommand: ERROR", err, err.stack);
    });
}

autoDeploy.startServer = function startServer() {
    Promises.start(function() {
        return autoDeploy.initVars();
    }).then(function(vars) {
        console.log("Starting server... ["+vars.server+"]");
        spawnChild(vars);
    }).catch(function(err) {
        console.log("startServer: ERROR", err, err.stack);
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
        console.log("install: ERROR", err, err.stack);
    });
}

autoDeploy.getLinks = function getLinks() {
    return Promises.start(function() {
        return autoDeploy.initVars();
    }).then(function(vars) {
        var links='';
        var extraParam = '';
        if(vars.param) {
            for(var p in vars.param) {
                extraParam += '&' + p + '=' + vars.param[p];
            }
        }
        for(var cmd in vars.commands) {
            links += '<a href="/auto-deploy?'+ cmd+ extraParam + '">' + cmd + '</a>|';
        }
        return links.substr(0, links.length-1);
    }).catch(function(err) {
        console.log("getLinks: ERROR", err, err.stack);
    });
};

exports = module.exports = autoDeploy;
