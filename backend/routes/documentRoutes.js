const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const upload = require('../middlewares/upload');

// 获取文件夹下的文档
router.get('/folder/:folderId', documentController.getDocumentsByFolder);

// 上传文档
router.post('/upload', upload.single('file'), documentController.uploadDocument);

module.exports = router;