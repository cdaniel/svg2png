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

var atob = require('atob');
var phantom = require('phantom');
var multer = require('multer');


var upload = multer({
    storage: multer.memoryStorage(),
    limits : {
        fileSize : 1024*1024*1024,
        files : 1
    }
    });

var svgToPNG = function(svgXML, width, height, res){

  phantom.create(['--ignore-ssl-errors=yes']).then(function(ph) {

      ph.createPage().then(function(page) {

          page.property('viewportSize', {
              width : width,
              height : height
          });

          page.property('content',
          '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' + svgXML);

          page.renderBase64('png').then(function(content64){
            res.writeHead(200, {
                'Content-Type': 'image/png'
            });
            res.end(atob(content64),'binary');
          });

          page.close();
          ph.exit();

      }).catch(
        function(e){
          console.log(e);
          res.end();
        }
      );
  }).catch(
    function(e){
      console.log(e);
      res.statusCode = 500;
      res.end();
    }
  );
};


module.exports = function(){
    var module = {};


    module.router = require('express').Router();

    // do actual conversion
    module.router.post('/' , upload.single('file'), function(req, res) {
        //TODO: sanity checks
        var width = req.query.width;
        var height = req.query.height;
        if(!width || width < 100 || width > 2000){
            res.status(422).json({ error: 'Width(' + width + ') should be > 100 but lower than 2000' });
            return;
        }
        if(!height || height < 100 || height > 1200){
            res.status(422).json({ error: 'Height(' + height + ') should be > 80 but lower than 1200' });
            return;
        }
        var svgFile = req.file; //unparsed
        if(!svgFile){
            res.status(422).json({ error: 'No file received' });
            return;
        }
        
        var svgXML = svgFile.buffer.toString('UTF-8');

        if(!svgXML.length > 1024 * 1024 * 1024 /*1MB*/){
            res.status(422).json({ error: 'The file is too big' });
            return;
        }
        svgToPNG(svgXML, width, height, res);
    });


    return module;
};

