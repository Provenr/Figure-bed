const multer = require('multer');

// 文件上传过滤器
const fileFilter = (request, file, callback) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        return callback(new Error('file wrong type :)'), false)
    }
    callback(null, true)
};

//  dest 设置了文件上传的位置
const upload = multer({ dest: 'upload/', fileFilter });

module.exports = {
    upload
};