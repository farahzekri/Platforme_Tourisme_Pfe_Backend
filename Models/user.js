const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Définir le schéma User
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['admin', 'subadmin', 'consumer', 'agency'], 
        required: true 
    },
    phoneNumber: { type: String, required: function () { return this.role === 'consumer' || this.role === 'agency'; } },
    address: { type: String, required: function () { return this.role === 'agency'; } },
    city: { type: String, required: function () { return this.role === 'agency'; } },
    country: { type: String, required: function () { return this.role === 'agency'; } },
    documents: { type: [String], required: function () { return this.role === 'agency'; } },
}, { timestamps: true });


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', userSchema);