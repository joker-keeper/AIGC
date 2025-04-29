const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    definition: {
        type: String,
        trim: true
    },
    scope: {
        type: Array,
        trim: true
    },
    application: {
        type: Array,
        trim: true
    },
    hotpot: {
        type: Array,
        trim: true
    },
    timeline: {
        type: Array,
        trim: true
    },
    conferences: {
        type: Array,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

domainSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Domain', domainSchema);