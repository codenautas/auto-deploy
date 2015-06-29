#!/usr/bin/env node

"use strict";

var program = require('commander');

program
    .usage('[options] server-to-run.js')
    .parse(process.argv);

//console.log("args", program.args);
if(""==program.args)
{
    program.help();
}

require('../auto-deploy/auto-deploy.js').startServer(program.args[0]);
