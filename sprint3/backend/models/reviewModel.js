
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    propertyId: { type: mongoose.Schema.type.ObjectId, ref: 'Listing' },
    rating: { type: Number },
    Comment: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
