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
                "server": "node example/server.js"
            });
            done();
    }).catch(function(err) {
        console.log("ERROR", err);
        console.log("STACK", err.stack);
        done(err);
    });
    });
  });
});
