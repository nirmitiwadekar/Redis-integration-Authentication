const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    isVerified: { type: Boolean, default: false },
    refreshToken: { type: String } // Store refresh token securely
}, { 
    timestamps: true, 
    collection: "Users" // Explicitly set collection name
});

const Users = mongoose.model("Users", userSchema);
module.exports = Users;
