"use strict";

var _ = require('lodash');
var expect = require('expect.js');
var Promises = require('best-promise');
var fs = require('fs-promise');
var expectCalled = require('expect-called');
var autoDeploy = require('../auto-deploy.js');

describe('auto-deploy', function(){
  describe('initialization', function(){
    it('must read auto-deploy section from package.json', function(done){
        return autoDeploy.initVars().then(function(vars) {
            //console.log(vars);
            expect(vars).to.eql({
                "commands": {
                    "reset": "git reset --hard",
                    "restart": "nop",
                    "stop": "exit",
                    "update": "git pull"
                },
                "server": "node example/server.js",
                "param": {"pid" : "3344"}
            });
            done();
        }).catch(function(err) {
            console.log("ERROR", err);
            console.log("STACK", err.stack);
            done(err);
        });
    });
    it('must set autoDeploy vars', function(done){
        return autoDeploy.initVars().then(function(vars) {
            //console.log(autoDeploy);
            expect(autoDeploy.childPID).to.eql(0);
            expect(autoDeploy.fOut).to.be.above(process.stderr.fd);
            expect(autoDeploy.fErr).to.be.above(process.stderr.fd);
            done();
        }).catch(function(err) {
            console.log("ERROR", err);
            console.log("STACK", err.stack);
            done(err);
        });
    });
  });
  describe('utility methods', function(){
    it('must generate links for predefined actions', function(done){
        return autoDeploy.getLinks().then(function(links) {
            //console.log(links);
            var elinks = '<a href="/auto-deploy?update&pid=3344">update</a>|'
                        +'<a href="/auto-deploy?reset&pid=3344">reset</a>|'
                        +'<a href="/auto-deploy?restart&pid=3344">restart</a>|'
                        +'<a href="/auto-deploy?stop&pid=3344">stop</a>';
            expect(links).to.eql(elinks);
            done();
        }).catch(function(err) {
            console.log("ERROR", err);
            console.log("STACK", err.stack);
            done(err);
        });
    });
  });
});
