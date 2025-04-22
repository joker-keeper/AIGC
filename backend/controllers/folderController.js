const Folder = require('../models/Folder');

// 获取所有文件夹
exports.getAllFolders = async (req, res) => {
  try {
    const folders = await Folder.find().sort({ createdAt: -1 });
    res.json(folders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 创建新文件夹
exports.createFolder = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    const existingFolder = await Folder.findOne({ name });
    if (existingFolder) {
      return res.status(400).json({ message: 'Folder already exists' });
    }

    const folder = new Folder({ name });
    await folder.save();
    
    res.status(201).json(folder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};