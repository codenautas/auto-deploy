var fsp = require('fs-promise');
console.log("Restarter (PID:%d): starts", process.pid);

var pkgjson='./package.json';
fsp.exists(pkgjson).then(function(exists) {
    if(!exists) { throw new Error("'"+pkgjson+"' does not exists"); }
    return fsp.readJson(pkgjson);
}).then(function(json) {
    var scriptToRun='/unexistentScript';
    var scriptName = process.argv[3];
    if(json.scripts && scriptName in json.scripts) {
        console.log("Restarter (PID:%d): script (%s)", process.pid, json.scripts[scriptName]);
        var jrun=json.scripts[scriptName].match(/^(node (.*))/);
        if(jrun) {
            console.log("Restarter (PID:%d): Tengo script (%s)", process.pid, jrun[2]);
            scriptToRun = jrun[2];
        }
    }
    return scriptToRun;
}).then(function(scriptToRun) {
    var spawn = require("child_process").spawn;
    var fs = require('fs')
    var logFile = process.argv[2];
    var out, err;
    if('ignore' !== logFile) {
        out = fs.openSync(logFile, 'a');
        err = fs.openSync(logFile, 'a');
    } else {
        out = err = logFile;
    }
    var childspawned = spawn('node', [scriptToRun],
                           { detached: true, stdio: [ 'ignore', out, err ] });
    console.log("Restarter (PID:%d): starts server(PID=%d)",
                 process.pid, childspawned.pid);
    console.log("Restarter (PID:%d): using config '%s' (%s)",
                 process.pid, process.argv[3], scriptToRun);
    setTimeout(function() {
        console.log("Restarter (PID:%d): ends", process.pid);
        process.exit(0);
    }, 3000); 
}).catch(function(err) {
    console.log("Error: ", err);
    console.log('STACK',err.stack);
});
