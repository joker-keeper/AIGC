const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');

// 获取所有文件夹
router.get('/', folderController.getAllFolders);

// 创建新文件夹
router.post('/', folderController.createFolder);

module.exports = router;