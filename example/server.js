var express = require('express');
var app = express();
var fs = require('fs');
//var autoDeploy = require('../auto-deploy.js');

var autoDeploy = fs.createWriteStream(null, {fd: 3});

var server = app.listen(5555, function() {
    console.log('-------------------------------------------');
    console.log('Server (PID:%d): listening on port %d ', process.pid, server.address().port);
});

function site_up(req,res){
    var restart_url='auto-deploy?restart=1&pid='+process.pid;
    var kill_url='auto-deploy?stop=1&pid='+process.pid;
    res.send("<h1>auto-deploy demo</h1><p> Running with PID:<b>"+process.pid+"</b>"
            +"<p>this site now is up"
            +"<p>you can restart it: <a href="+restart_url+">"+restart_url+"</a>"
            +"<p>or stop it: <a href="+kill_url+">"+kill_url+"</a>");
}

app.get('/index.html',site_up);
app.get('/',site_up);

app.get('/auto-deploy', function(req, res) {
    console.log("req", req.query);
    if(req.query.restart) {
        autoDeploy.write("restart");
    } else if(req.query.stop) {
        autoDeploy.write("stop");
        process.exit(0);
    }
    else {
        autoDeploy.write("Otra cosa");
    }

    //console.log("res", res);
   //autoDeploy.write(req.query); 
});
//app.use(autoDeploy({log:true, scriptName:'start' , logFile:'./server.log'}));
