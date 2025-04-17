const mongoose = require('mongoose')

const listingSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['sale', 'rent', 'temporary_rent'],
    required: true
  },
  propertyType: {
    type: String,
    enum: ['house', 'apartment', 'condo'],
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  bedrooms: Number,
  bathrooms: Number,
  area: Number,
  description: String,
  mainImage: String,
  images: [String],
  isAvailable: {
    type: Boolean,
    default: true,
    required: true
  },
  amenities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Amenity' }],
  price: Number,
  availability: {
    startDate: Date,
    endDate: Date
  },
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
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  isFeatured: { type: Boolean, default: false },
});
listingSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Listing', listingSchema);
