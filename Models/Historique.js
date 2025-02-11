const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
    {
        admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admins', required: true }, 
        action: { type: String, required: true },
        details: { type: String, required: true },
        date: { type: Date, default: Date.now } 
    }
);

module.exports = mongoose.model('History', historySchema);