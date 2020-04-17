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
const bucketName = 'provenr';

/* GET users listing. */
// router.get('/upload', function (req, res, next) {
//     console.log(req)
//     res.status(200).send({
//         url: 'https://provenr.obs.cn-north-4.myhuaweicloud.com/test/%E4%B8%8B%E8%BD%BD.jpeg'
//     });
//     return false
//     var file = JSON.parse(req.body);
//     console.log(file);
//     var fileName = file.filename;
//
//     obs.putObject({
//         Bucket: 'provenr',
//         Key: file.originalname,
//         Body: file,
//         // ContentType: 'text/plain'
//     }, (err, result) => {
//         if (err) {
//             console.error('Error-->' + err);
//             res.status(500).send('Error-->' + err);
//         } else {
//             if (result.CommonMsg.Status < 300) {
//                 res.status(200).send({
//                     url: baseServer + result.InterfaceResult.ETag
//                 });
//             } else {
//                 res.status(500).send('Code-->' + result.CommonMsg.Code + 'Message-->' + result.CommonMsg.Message);
//             }
//         }
//     });
// });
router.get('/list', function (req, res, next) {
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
