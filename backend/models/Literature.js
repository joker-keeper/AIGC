const mongoose = require('mongoose');

const literatureSchema = new mongoose.Schema({
    domainId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Domain',
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
    },
    author: {
        type: String,
    },
    publication: {
        type: String,
    },
    publishDate: {
        type: Date,
    },
    abstract: {
        type: String,
    },
    question: {
        type: String,
    },
    challenge: {
        type: String,
    },
    method: {
        type: String,
    },
    experiment: {
        type: String,
    },
    limitation_future_work: {
        type: String,
    },
    future_research: {
        type: String,
    }
    
    

});

module.exports = mongoose.model('Literature', literatureSchema);