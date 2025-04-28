// models/Figure.js
const mongoose = require('mongoose');

const FigureSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  figures: [
    {
      figureId: String,
      imageUrl: String,
      caption: String,
      pageNumber: Number,
      position: {
        top: Number,
        left: Number
      }
    }
  ]
});

module.exports = mongoose.model('Figure', FigureSchema);