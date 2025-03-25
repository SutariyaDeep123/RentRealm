const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'provider', 'admin'],
    required: true
  },
  firstName: { type: String, required: true },
  lastName: { type: String,  },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId:String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  profilePicture: String,
  listings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  paymentMethods: [{
    type: { type: String, enum: ['credit_card', 'paypal'] },
    details: mongoose.Schema.Types.Mixed
  }],
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  createdAt: { type: Date, default: Date.now }
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

// Add virtual property for full name
userSchema.virtual('name').get(function() {
  if (this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName;
});

module.exports = mongoose.model('User', userSchema);
