const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookingType: { 
        type: String, 
        enum: ['hotel', 'listing'], 
        required: true 
    },
    // For hotel bookings
    room: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Room',
        required: function() { return this.bookingType === 'hotel'; }
    },
    hotel: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Hotel',
        required: function() { return this.bookingType === 'hotel'; }
    },
    // For listing bookings
    listing: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Listing',
        required: function() { return this.bookingType === 'listing'; }
    },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    guestCount: { type: Number, required: true },
    specialRequests: String,
    createdAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model('Booking', bookingSchema);
  