const mongoose = require('mongoose');

const physioSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: Date, required: true },
        preHeartRate: { type: Number, default: 0 },
        postHeartRate: { type: Number, default: 0 },
        deepSleepMinutes: { type: Number, default: 0 },
        lightSleepMinutes: { type: Number, default: 0 },
        remSleepMinutes: { type: Number, default: 0 },
        avgSleepHeartRate: { type: Number, default: 0 },
        notes: { type: String, default: '' }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Physio', physioSchema);
