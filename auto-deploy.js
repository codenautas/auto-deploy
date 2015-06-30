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
    child: null,
    childPath: null
};

autoDeploy.initVars = function initVars() {
    var vars={};
    return Promises.start(function() {
        return fs.readJson(__dirname+'/auto-deploy.json');
    }).then(function(json){
        var adp=json['auto-deploy'];
        if(!adp) { throw new Error('Missing "auto-deploy" section in package.json');  }
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

function spawnChildNoPipe(theChildPath) {
    var cargs=theChildPath.split(' ');
    var cmd=cargs[0];
    if(cargs.length>1) {
        cargs.splice(0, 1);
    } else {
        cmd = "node";
    }
    var child =spawn(cmd, cargs, {stdio: [ 'ignore', autoDeploy.fOut, autoDeploy.fErr, 'pipe'], env:{'I_AM_A_CHILD':1} });
    return child;
}

function spawnChild(theChildPath) {
    autoDeploy.child = spawnChildNoPipe(theChildPath);
    autoDeploy.child.stdio[3].on('data', autoDeploy.handleCommand);
}

autoDeploy.doRestart = function doRestart(theChildPath) {
    spawnChild(theChildPath);
    console.log("Re-starting server... ["+theChildPath+"] PID:", autoDeploy.child.pid);
}

autoDeploy.handleCommand = function handleCommand(msg) {
    Promises.start(function() {
        return autoDeploy.initVars();
    }).then(function(vars) {
        var cmd=decodeURI(msg.toString("utf8"));
        var restart = true;
        if(cmd in vars.commands) {
            autoDeploy.child.on('exit', function() {
               var runCmd = vars.commands[cmd];
                console.log("Procesando ", cmd);
                var srv=autoDeploy.childPath;
                if('exit' != runCmd) { // solo si hay que reiniciar
                    if('nop' === runCmd) {
                        autoDeploy.doRestart(srv);
                    } else { // tenemos algo que ejecutar
                        var chld = spawnChildNoPipe(runCmd);
                        chld.on('exit', function() {
                           autoDeploy.doRestart(srv); 
                        });
                        chld.on('error', function(err) {
                           console.log(runCmd+' error:', err);
                           autoDeploy.doRestart(srv);
                        });
                    }
                }
            });
            process.kill(autoDeploy.child.pid);
        } else { console.log("command not in list: ", cmd); }
    }).catch(function(err) {
        console.log("handleCommand: ERROR", err, err.stack);
    });
}

autoDeploy.startServer = function startServer(_server_name) {
    autoDeploy.childPath = _server_name;
    Promises.start(function() {
         return autoDeploy.initVars();
     }).then(function(vars) {
        console.log("Starting server... ["+_server_name+"]");
        spawnChild(_server_name);
    }).catch(function(err) {
        console.log("startServer: ERROR", err, err.stack);
    });
};

autoDeploy.install = function install(app) {
    if(!process.env['I_AM_A_CHILD']) {
        throw new Error('An auto-deploy client should be started with auto-deploy-run.js');
    }
    return Promises.start(function() {
        return autoDeploy.initVars();
    }).then(function(vars) {
        process.stdout.write("Connecting auto-deploy...");
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
        process.stdout.write(" connected.\n");
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
            links += '<a href="/auto-deploy?'+ encodeURI(cmd + extraParam) + '">' + cmd + '</a>|';
        }
        return links.substr(0, links.length-1);
    }).catch(function(err) {
        console.log("getLinks: ERROR", err, err.stack);
    });
};

exports = module.exports = autoDeploy;
