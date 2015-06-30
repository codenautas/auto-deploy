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
var Path = require('path');

var autoDeploy = {
    fOut: process.stdout,
    fErr: process.stderr,
    child: null,
    childPath: null,
    pid: 0
};

function spawnChildNoPipe(theChildPath) {
    var cargs=theChildPath.split(' ');
    var cmd=cargs[0];
    if(cargs.length>1) {
        cargs.splice(0, 1);
    } else {
        cmd = "node";
    }
    var child =spawn(cmd, cargs,
                     {
                      stdio: [ 'ignore', autoDeploy.fOut, autoDeploy.fErr, 'pipe'],
                      env:{'AUTODEPLOY_PARENT': Path.basename(process.mainModule.filename)}
                     }
                    );
    return child;
}

function spawnChild(theChildPath) {
    autoDeploy.child = spawnChildNoPipe(theChildPath);
    autoDeploy.child.stdio[3].on('data', autoDeploy.handleCommand);
}

autoDeploy.doRestart = function doRestart(theChildPath) {
    spawnChild(theChildPath);
    console.log("Re-starting server... ["+theChildPath+"] PID:", autoDeploy.child.pid);
};

autoDeploy.parseParams = function parseParams(params) {
    console.log("startServer", params);
    autoDeploy.childPath = params.serverPath;
    if(params.logFile) {
        console.log("Using '"+params.logFile+"'");
        autoDeploy.fOut = fs.openSync(params.logFile, 'a');
        autoDeploy.fErr = fs.openSync(params.logFile, 'a');
    }
};

autoDeploy.handleCommand = function handleCommand(msg) {
        var cmd=decodeURI(msg.toString("utf8"));
        var restart = true;
        autoDeploy.child.on('exit', function() {
            if(cmd === 'restart') {
                // ejecutar 
                // - git pull
                // - npm prune
                // - npm install
                autoDeploy.doRestart(autoDeploy.childPath);
            }
        });
        process.kill(autoDeploy.child.pid);
}

autoDeploy.startServer = function startServer(params) {
    autoDeploy.parseParams(params);
    console.log("Starting server... ["+autoDeploy.childPath+"]");
    spawnChild(autoDeploy.childPath);
};

autoDeploy.middleware = function middleware(opts){
    if(process.env['AUTODEPLOY_PARENT'] !== 'auto-deploy-runner.js') {
        throw new Error('An auto-deploy client should be started with auto-deploy-runner.js');
    }
    var pid=opts.pid || _process.pid;
    return function(req, res) {
        if(req.query.pid && req.query.pid == pid) {
            var laPipa = fs.createWriteStream(null,{fd: 3});
            if('stop' in req.query) {
                laPipa.write('stop');
            } else if('restart' in req.query) {
                laPipa.write('restart');
            } else {
                console.log("Ups!");
            }
        }// else { console.log("no ejecuto"); }
    };
};

exports = module.exports = autoDeploy;