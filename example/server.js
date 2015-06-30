var express = require('express');
var app = express();
var fs = require('fs');
var autoDeploy = require('../auto-deploy.js');

var apUrl='/tools';
var apPID=12345;

var server = app.listen(5555, function() {
    console.log('-------------------------------------------');
    console.log('Server (PID:%d): listening on port %d ', process.pid, server.address().port);
});

function site_up(req,res){
    res.send("<h1>auto-deploy demo</h1><p> Running with PID:<b>"+process.pid+"</b>"
            +"<p>this site now is up"
            +"<p>Your options:\n"
            +'  <li>Restart: <a href="'+apUrl+'/auto-deploy?restart&pid='+apPID+'">Restart</a>\n'
            +'  <li>Restart: <a href="'+apUrl+'/auto-deploy?stop&pid='+apPID+'">Stop</a>\n');
}

app.get('/index.html',site_up);
app.get('/',site_up);

app.use(apUrl, autoDeploy.middleware({pid:12345, log:true, logFile:'./slog.log'}));
