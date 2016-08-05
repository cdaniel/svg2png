//#!/bin/env node
/* Copyright 2016 Leading Edge Forum

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/

var should = require('should');
var app = require('../lib/app');
var request = require('supertest');

describe('POST /', function() {

    var _assertErrorMessage = function(msg) {
        return function(res) {
            var errorMsg = JSON.parse(res.text).error;
            if (errorMsg !== msg) {
                throw new Error('Unexpected error message:' + errorMsg +',\n while it should be ' + msg);
            }
        }
    };
    
    it('should complain about invalid width', function(done) {
        request(app)
        .post('/')
        .expect(422)
        .expect(_assertErrorMessage("Width(undefined) should be > 100 but lower than 2000"))
        .end(function(err, res) {
            if (err) throw err;
            done();
        });
    });

    it('should complain about too small width', function(done) {
        request(app)
        .post('/?width=5')
        .expect(422)
        .expect(_assertErrorMessage("Width(5) should be > 100 but lower than 2000"))
        .end(function(err, res) {
            if (err) throw err;
            done();
        });
    });

    it('should complain about too big width', function(done) {
        request(app)
        .post('/?width=5000')
        .expect(422)
        .expect(_assertErrorMessage("Width(5000) should be > 100 but lower than 2000"))
        .end(function(err, res) {
            if (err) throw err;
            done();
        });
    });
    
    it('should complain about missing heigth', function(done) {
        request(app)
        .post('/?width=500')
        .expect(422)
        .expect(_assertErrorMessage("Height(undefined) should be > 80 but lower than 1200"))
        .end(function(err, res) {
            if (err) throw err;
            done();
        });
    });
    
    it('should complain about heigth being too small', function(done) {
        request(app)
        .post('/?width=500&height=10')
        .expect(422)
        .expect(_assertErrorMessage("Height(10) should be > 80 but lower than 1200"))
        .end(function(err, res) {
            if (err) throw err;
            done();
        });
    });
    
    it('should complain about heigth being too large', function(done) {
        request(app)
        .post('/?width=500&height=2000')
        .expect(422)
        .expect(_assertErrorMessage("Height(2000) should be > 80 but lower than 1200"))
        .end(function(err, res) {
            if (err) throw err;
            done();
        });
    });
    
    it('should complain about missing file', function(done) {
        request(app)
        .post('/?width=500&height=250')
        .expect(422)
        .expect(_assertErrorMessage("No file received"))
        .end(function(err, res) {
            if (err) throw err;
            done();
        });
    });
    
    it('should generate a file', function(done) {
        request(app)
        .post('/?width=500&height=250')
        .attach('file','tests/_image.svg')
        .expect(200)
        .end(function(err, res) {
            if (err) throw err;
            done();
        });
    });

});
