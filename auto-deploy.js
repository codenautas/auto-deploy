/*!
 * auto-deploy
 * 2015 Codenautas
 * GNU Licensed
 */
"use strict";

var express = require('express');

var autoDeploy = exports = module.exports = function autoDeploy(opts){
    var killer=express();
    var _process=opts.process || process;
    var pid=opts.pid || _process.pid;
    if(autoDeploy.isRedirectCode(opts.statusKilled) && !('location' in opts)){
        throw new Error('auto-deploy: options.location required');
    };
    if(autoDeploy.isRedirectCode(opts.statusBad) && !('locationBad' in opts)){
        throw new Error('auto-deploy: options.locationBad required');
    };
    if(!autoDeploy.isRedirectCode(opts.statusKilled) && ('location' in opts)){
        throw new Error('auto-deploy: options.location is only for redirect');
    };
    if(!autoDeploy.isRedirectCode(opts.statusBad) && ('locationBad' in opts)){
        throw new Error('auto-deploy: options.locationBad is only for redirect');
    };
    if(opts.log){
        console.log('auto-deploy (PID:%d): installed', pid);
    }
    killer.get('/'+(opts.statement||'auto-deploy'),function killer(req,res){
        if(req.query.pid==pid){
            res.status(opts.statusKilled||autoDeploy.defaults.statusKilled);
            if(opts.location){
                res.header('Location',opts.location);
            }

            if(req.query.restart == 1) {
                var fs = require('fs');
                var doer_out = './subproc_out.log';
                var out = fs.openSync(doer_out, 'a'),
                    err = fs.openSync(doer_out, 'a');

                var spawn=require("child_process").spawn;
                var nenv = process.env;
                nenv["DOER_SCRIPT"]=opts.scriptName;
                var restarter = spawn('node', [require('path').normalize(__dirname + "/restarter.js")],
                                              { env: nenv, detached: true, stdio: [ 'ignore', out, err ] });
                console.log('auto-deploy (PID:%d): starts restarter (PID:%d)', pid, restarter.pid);
                res.send('<html><head>'+
                         '<meta http-equiv="refresh" content="2; url=/" /><head>'+
                         '<body><h3>Ejecuting restart...</h3></body></html>');
            }
            else {
                res.send(opts.messageKilled||'auto-deploy success');
            }
            console.log('auto-deploy (PID:%d): ends', pid);
            _process.exit(opts.exitCode||autoDeploy.defaults.exitCode);

        }else{
            res.status(opts.statusBad||autoDeploy.defaults.statusBad);
            if(opts.locationBad){
                res.header('Location',opts.locationBad);
            }
            res.send(opts.messageBad||'auto-deploy unknown');
        }
    });
    return killer;
};

autoDeploy.defaults={
    statusKilled:200,
    exitCode:0,
    statusBad:404
};

autoDeploy.isRedirectCode = function isRedirectCode(htmlCode){
    return htmlCode>=300 && htmlCode<=303;
};
