var express = require('express');
var router = express.Router();
var obsClient = require('esdk-obs-nodejs');
const fs = require("fs");
const path = require("path");
const bodyParser = require('body-parser');

var formidable = require("formidable");

var obs = new obsClient({
  access_key_id: 'KL5GLFAYKAFPPDBA32KR',
  secret_access_key: 'iokhdpJReyUCSK9fFuDzv4RxTI9enLTAbunbgKrY',
  server: 'obs.cn-north-4.myhuaweicloud.com'
});
const baseServer = 'https://provenr.obs.cn-north-4.myhuaweicloud.com/';
var bucketName = 'provenr';
var keys = [];

//引入上传模块
var { upload } = require('../utils/upload');

/* GET home page. */
router.get('/', function(req, res, next) {
  let imgList = [];
  let Unique = {};
  obs.listObjects({
    Bucket: 'provenr',
    Prefix: 'test/'
  }).then((result) => {
    if(result.CommonMsg.Status < 300){
      for(let j=0;j<result.InterfaceResult.Contents.length;j++){
        let etag = result.InterfaceResult.Contents[j]['ETag'];
        let key = result.InterfaceResult.Contents[j]['Key'];
        if (!/.+\/$/.test(key)){
          let img = {
            Url: baseServer + result.InterfaceResult.Contents[j]['Key'],
            Etag: etag
          };
          imgList.push(img);
        } else {
          Unique[etag] = 1;
        }
      }
    }
    res.render('index', { title: 'Express', list: imgList});
  });


  // 关闭obsClient
  // obsClient.close();
});

router.use(bodyParser.json());//数据JSON类型
router.use(bodyParser.urlencoded({ extended: false }));//解析post请求数据

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

router.post('/uploads', function(req, res, next){
  var form = new formidable.IncomingForm();
  // var file = req.file;
  form.parse(req, function(error, fields, files) {

    let imgPath = files.file.path;
    let imgname = files.file.name;
    let fileType = files.file.type;
      console.log(imgPath);


    let imgData = fs.createReadStream(imgPath);
      obs.putObject({
          Bucket : 'provenr',
          Key : imgname,
          // SourceFile : imgPath,
          Body : imgData,
          ContentType: fileType
      },(err, result) => {
          if(err){
              console.error('Error-->' + err);
              res.send('Error-->' + err);
          }else{
              if(result.CommonMsg.Status < 300){
                  let url = baseServer + imgname;
                  res.render('uploads', { url: url});
              }else{
                  res.send('Code-->' + result.CommonMsg.Code + 'Message-->' + result.CommonMsg.Message);
              }
          }
      });
  });



});

module.exports = router;
