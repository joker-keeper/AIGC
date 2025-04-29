const express = require('express');
const router = express.Router();
const overviewController = require('../controllers/overviewController');
const upload = require('../middlewares/upload');

//获取所有领域信息
router.get('/getAllDomains', overviewController.getAllDoamins);
//创建新领域
router.post('/createDomain', overviewController.createDomain);
// 上传文档
router.post('/uploadLiterature', upload.single('file'), overviewController.uploadLiterature);
// 获取领域的文献
router.get('/getLiteraturesByFolder/:domainId', overviewController.getLiteraturesByFolder);


module.exports = router;