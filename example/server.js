var express = require('express');
var app = express();
var autoDeploy = require('../auto-deploy.js');

var server = app.listen(5555, function() {
    console.log('-------------------------------------------');
    console.log('Server (PID:%d): listening on port %d ', process.pid, server.address().port);
});

function site_up(req,res){
    var restart_url='auto-deploy?restart=1&pid='+process.pid;
    var kill_url='auto-deploy?pid='+process.pid;
    res.send("<h1>auto-deploy demo</h1><p> Running with PID:<b>"+process.pid+"</b>"
            +"<p>this site now is up"
            +"<p>you can restart it: <a href="+restart_url+">"+restart_url+"</a>"
            +"<p>or stop it: <a href="+kill_url+">"+kill_url+"</a>");
}

app.get('/index.html',site_up);
app.get('/',site_up);

app.use(autoDeploy({log:true, scriptName:'start' , logFile:'./server.log'}));
