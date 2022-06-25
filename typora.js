const fs = require('fs');
const path = require('path');
var obsClient = require('esdk-obs-nodejs');
const dayjs = require('dayjs')
// import got from 'got';

var obs = new obsClient({
  access_key_id: 'xxx',
  secret_access_key: 'xxx',
  server: 'obs.cn-north-4.myhuaweicloud.com'
});
const baseServer = 'http://img.provenr.cn/';


// 获取文件名
const getFileName = (path) => {
  const extensionName = path.split('/').pop().split('.')[1];
  return `${dayjs().format('YYYY-MM-DD')}_${Date.now()}.${extensionName}`;
}
const uploadFile = (filePath, uploadSource) => {
  const fileName = getFileName(filePath);
  return new Promise((resolve, reject) => {
    obs.putObject({
      Bucket: 'provenr',
      Key: `${uploadSource}/${fileName}`,
      Body: fs.createReadStream(filePath),
    }, (err, result) => {
      if (err) {
        console.error('Error-->' + err);
        reject(err);
      } else {
        if (result.CommonMsg.Status < 300) {
          resolve( baseServer + `${uploadSource}/${fileName}`);
        } else {
          reject(result.CommonMsg.Code + 'Message-->' + result.CommonMsg.Message);
        }
      }
    });
  });
}

const init = (argv) => {
  let uploadSource = 'Typora'
  let files = argv
  if (argv[0].indexOf('--source') === 0) {
    uploadSource = argv[0].split('=')[1]
    files = argv.slice(1)
  }
  files.forEach(async (item, index) => {
    const url = await uploadFile(item, uploadSource);
    console.log(url);
  });
}
init(process.argv.slice(2));

