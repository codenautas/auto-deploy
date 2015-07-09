#!/usr/bin/env node

"use strict";

var program = require('commander');

program
    .usage('[options] server-to-run.js')
    .option('-l, --log-file [logfile.log]', 'Define a log file')    
    .parse(process.argv);

//console.log("program", program);
//console.log("args", program.args);
if(""==program.args) { program.help(); }

var params={};
params.serverPath = program.args[0];
params.logFile = program.logFile;

require('../auto-deploy/auto-deploy.js').startServer(params);
