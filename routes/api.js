var express = require('express');
var router = express.Router();

var obsClient = require('esdk-obs-nodejs');
const fs = require("fs");
const path = require("path");
const bodyParser = require('body-parser');

// 表单提交
var formidable = require("formidable");

// ajax 请求
router.use(bodyParser.json());//数据JSON类型

// extended - 使用哪种库解析
// extended => false, qs library
// person[name]=bobby&person[age]=3 => { 'person[age]': '3', 'person[name]': 'bobby' }
// "?a=b"  => { a: 'b' }

// extended => true, querystring library （default） nested object
// person[name]=bobby&person[age]=3  =>  { person: { name: 'bobby', age: '3' } }
// "?a=b"  => { '?a': 'b' }

router.use(bodyParser.urlencoded({ extended: false }));

var obs = new obsClient({
    access_key_id: 'KL5GLFAYKAFPPDBA32KR',
    secret_access_key: 'iokhdpJReyUCSK9fFuDzv4RxTI9enLTAbunbgKrY',
    server: 'obs.cn-north-4.myhuaweicloud.com'
});
const baseServer = 'https://provenr.obs.cn-north-4.myhuaweicloud.com/';
const bucketName = 'provenr';


router.post('/upload', function (req, res, next) {
    console.log(req)
    res.status(200).send({
        url: 'https://provenr.obs.cn-north-4.myhuaweicloud.com/test/%E4%B8%8B%E8%BD%BD.jpeg'
    });
    return false
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

router.post('/uploadForm', function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(error, fields, files) {

      let fileReName = fields.filename;

      let imgPath = files.file.path;
      let imgname = files.file.name;
      let fileType = files.file.type;
      let fileSize = files.file.size;

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
            let url = `${baseServer} + ${fileReName ? fileReName : imgname}`;
            res.status(200).send({ url: url});
          }else{
            res.send('Code-->' + result.CommonMsg.Code + 'Message-->' + result.CommonMsg.Message);
          }
        }
      });
    });
    // next()
});

/* GET Picture listing. */
router.get('/list', function (req, res, next) {
    // let query = req.query // ?id=12
    // let params = req.params // list/:id
    // console.log(req);

    // res.send({query, params});
    obs.listObjects({
        Bucket: bucketName,
        Prefix: 'test/'
    }, (err, result) => {
        if (err) {
            console.error('Error-->' + err);
            res.status(500).send('Error-->' + err);
        } else {
            if (result.CommonMsg.Status < 300 && result.InterfaceResult) {
                const Contents = result.InterfaceResult.Contents;
                let list = Contents.map(item => {
                    // 过滤文件夹
                    // 添加绝对根路径
                    let key = item.Key;
                    if (!/.+\/$/.test(key)) {
                        item.Url = baseServer + key;
                        return item;
                    }
                });
                res.status(200).send(list);
            } else {
                res.status(500).send('Code-->' + result.CommonMsg.Code + 'Message-->' + result.CommonMsg.Message);
            }
        }
    });
});

module.exports = router;
