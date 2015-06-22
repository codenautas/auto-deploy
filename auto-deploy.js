/*!
 * auto-deploy
 * 2015 Codenautas
 * GNU Licensed
 */
"use strict";
var Promises = require('best-promise');
var express = require('express');
var fs = require('fs-promise');

// var autoDeploy = exports = module.exports = function autoDeploy(opts){
    // var killer=express();
    // var _process=opts.process || process;
    // var pid=opts.pid || _process.pid;
    // var logFile = opts.logFile || './auto-deploy.log';
    // if(opts.log==false) { logFile = 'ignore'; }
    // var logFile = opts.log ? opts.logFile || './auto-deploy.log' : 'ignore';
    // if(autoDeploy.isRedirectCode(opts.statusKilled) && !('location' in opts)){
        // throw new Error('auto-deploy: options.location required');
    // };
    // if(autoDeploy.isRedirectCode(opts.statusBad) && !('locationBad' in opts)){
        // throw new Error('auto-deploy: options.locationBad required');
    // };
    // if(!autoDeploy.isRedirectCode(opts.statusKilled) && ('location' in opts)){
        // throw new Error('auto-deploy: options.location is only for redirect');
    // };
    // if(!autoDeploy.isRedirectCode(opts.statusBad) && ('locationBad' in opts)){
        // throw new Error('auto-deploy: options.locationBad is only for redirect');
    // };
    // if(opts.log) {
        // console.log('auto-deploy (PID:%d): installed', pid);
    // }
    // killer.get('/'+(opts.statement||'auto-deploy'),function killer(req,res){
        // if(req.query.pid==pid){
            // res.status(opts.statusKilled||autoDeploy.defaults.statusKilled);
            // if(opts.location){
                // res.header('Location',opts.location);
            // }

            // if(req.query.restart == 1) {
                // var fs = require('fs');
                // var out, err;
                // if('ignore' !== logFile) {
                    // out = fs.openSync(logFile, 'a');
                    // err = fs.openSync(logFile, 'a');
                // } else {
                    // out = err = logFile;
                // }
                // var spawn=require("child_process").spawn;
                // var restarter = spawn('node', [require('path').normalize(__dirname + "/restarter.js"), logFile, opts.scriptName],
                                              // { detached: true, stdio: [ 'ignore', out, err ] });
                // console.log('auto-deploy (PID:%d): starts restarter (PID:%d)', pid, restarter.pid);
                // res.send('<html><head>'+
                         // '<meta http-equiv="refresh" content="2; url=/" /><head>'+
                         // '<body><h3>Ejecuting restart...</h3></body></html>');
            // }
            // else {
                // res.send(opts.messageKilled||'auto-deploy success');
            // }
            // console.log('auto-deploy (PID:%d): ends', pid);
            // _process.exit(opts.exitCode||autoDeploy.defaults.exitCode);

        // }else{
            // res.status(opts.statusBad||autoDeploy.defaults.statusBad);
            // if(opts.locationBad){
                // res.header('Location',opts.locationBad);
            // }
            // res.send(opts.messageBad||'auto-deploy unknown');
        // }
    // });
    // return killer;
// };

// autoDeploy.defaults={
    // statusKilled:200,
    // exitCode:0,
    // statusBad:404
// };

// autoDeploy.isRedirectCode = function isRedirectCode(htmlCode){
    // return htmlCode>=300 && htmlCode<=303;
// };

function handleCommand(msg) {
    console.log("msg", msg.toString('utf8'));
}

Promises.start(function() {
    return fs.readJson('./package.json');
}).then(function(json){
    var adp=json['auto-deploy'];
    //console.log(adp);
    if(!adp) { throw new Error('Missing "auto-deploy" section in package.json');  }
    var startCmd = adp['server'];
    if(!startCmd) { throw new Error('Missing "server" section in "auto-deploy" section of package.json'); }
    var cmds=json['auto-deploy']['commands'];
    if(!cmds) { throw new Error('No commands to run for auto-deploy'); }
    console.log('ejecutando');
    var cargs=startCmd.split(' ');
    var cmd=cargs[0];
    cargs.splice(0, 1);
    console.log("cmd", cmd);
    console.log("cargs", cargs);
    var serv = require("child_process").spawn(cmd, cargs,
                   //{stdio: [ 'ignore', process.stdout, process.stderr, 'pipe'] });
                   {stdio: [ 'ignore', 'ignore', process.stderr, 'pipe'] });
    serv.stdio[3].on('data', handleCommand); 
}).catch(function(err) {
    console.log("ERROR", err);
});

