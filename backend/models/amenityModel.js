const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        unique: true
    },
    icon: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Amenity', amenitySchema); 