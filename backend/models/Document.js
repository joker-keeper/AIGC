const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  filePath: { type: String, required: true },
  fileSize: { type: Number, required: true },
  description: { type: String },
  tags: [{ type: String }]
});

module.exports = mongoose.model('Document', documentSchema);