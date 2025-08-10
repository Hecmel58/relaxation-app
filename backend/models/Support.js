const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        subject: { type: String, default: '' },
        message: { type: String, default: '' }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Support', supportSchema);
