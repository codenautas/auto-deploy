var express = require('express');
var app = express();
var fs = require('fs');
var autoDeploy = require('../auto-deploy.js');

var adlinks = '';
autoDeploy.getLinks().then(function(links) {
   var urls=links.split('|');
   for(var i=0; i<urls.length; ++i) {
       adlinks += '<li>'+urls[i]+'\n';
   }
});

var server = app.listen(5555, function() {
    console.log('-------------------------------------------');
    console.log('Server (PID:%d): listening on port %d ', process.pid, server.address().port);
});

function site_up(req,res){
    res.send("<h1>auto-deploy demo</h1><p> Running with PID:<b>"+process.pid+"</b>"
            +"<p>this site now is up"
            +"<p>Your options:\n"+adlinks);
}

app.get('/index.html',site_up);
app.get('/',site_up);

//app.use(autoDeploy.middleware({pid:12345}));
app.use('/tools', autoDeploy.middleware({pid:12345}));
