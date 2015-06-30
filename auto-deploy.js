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
    pid: 0,
    // commands: [
        // 'git pull',
        // 'npm prune',
        // 'npm install'
    // ];
    commands: [
        //'comando que da error',
        'ls -l',
        'c:\\WINDOWS\\unixutil\\which.exe ls.exe',
        'ls'
    ]
};

function spawnChildNoNode(theChildPath, exeRunner) {
    var cargs=theChildPath.split(' ');
    var marg=exeRunner ? 1 : 0;
    var cmd=cargs[0];
    if(cargs.length>marg) {
        cargs.splice(0, 1);
    }
    if(exeRunner) { cmd = exeRunner; }
    var child =spawn(cmd, cargs,
                     {
                      stdio: [ 'ignore', autoDeploy.fOut, autoDeploy.fErr, 'pipe'],
                      env:{'AUTODEPLOY_PARENT': Path.basename(process.mainModule.filename)}
                     }
                    );
    return child;
}

function spawnChildNoPipe(theChildPath) {
    return spawnChildNoNode(theChildPath, 'node');
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

function runCmd(cmd, done){
    console.log("RUNNING:", cmd);
    var p = spawnChildNoNode(cmd)
    p.on('exit', function(code){
        var err = null;
        if (code) {
            err = new Error('command "'+ cmd +'" exited with wrong status code "'+ code +'"');
            err.code = code;
            err.cmd = cmd;
        }
        if (done) done(err);
    });
    p.on('error', function(err) {
        if(done) {
            done(err);
        } else {
            console.log("Command Error:", err)
        }
    });
};

function runAll(cmds, done) {
    var next = function() {
        runCmd(cmds.shift(), function(err) {
           if(err){
               done(err);
           } else {
               if(cmds.length) {
                   next();
               } else {
                   done(null);
               }
           }
        });
    };
    next();
}

autoDeploy.handleCommand = function handleCommand(msg) {
        var cmd=decodeURI(msg.toString("utf8"));
        var restart = true;
        autoDeploy.child.on('exit', function() {
            if(cmd === 'restart') {
                var cmds=autoDeploy.commands.slice(0); // hacemos una copia
                runAll(cmds, function(err) {
                    if(err) { console.log("Error: ", err); }
                    autoDeploy.doRestart(autoDeploy.childPath);
                });
            }
        });
        process.kill(autoDeploy.child.pid);
}

autoDeploy.handleCommandOK = function handleCommandOK(msg) {
        var cmd=decodeURI(msg.toString("utf8"));
        var restart = true;
        autoDeploy.child.on('exit', function() {
            if(cmd === 'restart') {
                console.log("va ls 1");
                var c1 = spawnChildNoNode('ls -al');
                c1.on('exit', function() {
                    console.log("va which");
                    var c2 = spawnChildNoNode('c:\\WINDOWS\\unixutil\\which.exe ls.exe');
                    c2.on('exit', function() {
                        console.log("va ls a secas");
                        var c3 = spawnChildNoNode('ls');
                        c3.on('exit', function() {
                            autoDeploy.doRestart(autoDeploy.childPath); 
                        });
                        c3.on('error', function() {
                            console.log('hostname error:', err);
                            autoDeploy.doRestart(autoDeploy.childPath);
                        });
                    });
                    c2.on('error', function() {
                        console.log('which error:', err);
                        autoDeploy.doRestart(autoDeploy.childPath);
                    });
                });
                c1.on('error', function(err) {
                    console.log('ls error:', err);
                    autoDeploy.doRestart(autoDeploy.childPath);
               });                
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