const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const b2bSchema = new mongoose.Schema(
    {
        nameAgence: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true },
        documents: { type: [String], required: true }, 
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, 
        typeAgence: { type: String, required: true }, 
        contract: {
            startDate: { type: Date },
            endDate: { type: Date},
            duration: { type: String}, 
            amount: { type: Number },
            contractFile: { type: String } 
        }
    },
    { timestamps: true }
);
b2bSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('B2B', b2bSchema);