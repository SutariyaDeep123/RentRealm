const mongoose = require('mongoose')
const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  description: String,
  mainImage: String,
  images: [String],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  amenities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
hotelSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hotel', hotelSchema);
