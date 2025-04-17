const mongoose = require('mongoose')
const roomSchema = new mongoose.Schema({
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    type: {
      type: String,
      enum: ['single', 'double', 'suite'],
      required: true
    },
    description: String,
    price: { type: Number, required: true },
    images: [String],
    amenities: [{type: mongoose.Schema.Types.ObjectId, ref: 'Amenity',}]
  });
  
  module.exports  = mongoose.model('Room', roomSchema);
  