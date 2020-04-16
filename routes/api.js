var express = require('express');
var router = express.Router();

var obsClient = require('esdk-obs-nodejs');
const fs = require("fs");
const path = require("path");
const bodyParser = require('body-parser');

var formidable = require("formidable");
/* GET users listing. */
router.post('/upload', function(req, res, next) {
  var file = JSON.parse(req.body);
  console.log(file);
  var fileName = file.filename;

  obs.putObject({
    Bucket: 'provenr',
    Key: file.originalname,
    Body: file,
    // ContentType: 'text/plain'
  }, (err, result) => {
    if (err) {
      console.error('Error-->' + err);
      res.status(500).send('Error-->' + err);
    } else {
      if (result.CommonMsg.Status < 300) {
        res.status(200).send({
          url: baseServer + result.InterfaceResult.ETag
        });
      } else {
        res.status(500).send('Code-->' + result.CommonMsg.Code + 'Message-->' + result.CommonMsg.Message);
      }
    }
  });
});

module.exports = router;
