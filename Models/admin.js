const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schéma pour Admin/Subadmin
const adminSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['admin', 'superadmin'], required: true },
    },
    { timestamps: true }
);
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('Admins', adminSchema);