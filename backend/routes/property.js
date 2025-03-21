const express = require('express');
const errorMiddleware = require('../middleware/errorMiddleware');
const ApiError = require('../errors/ApiError');
const router = express.Router();
const User = require('../models/userModel');
const ApiResponse = require('../utils/ApiResponse');
const listingModel = require('../models/listingModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/add-listings', upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 }
]), errorMiddleware(async (req, res) => {
    const listingData = { ...req.body };
    
    // Parse the location data
    if (typeof req.body.location === 'string') {
        listingData.location = JSON.parse(req.body.location);
    }

    listingData.mainImage = req.files['mainImage'] ? req.files['mainImage'][0].filename : null;
    listingData.images = req.files['additionalImages'] ? req.files['additionalImages'].map(file => file.filename) : [];

    // Ensure the location is in the correct GeoJSON format
    if (listingData.location && Array.isArray(listingData.location.coordinates)) {
        listingData.location = {
            type: 'Point',
            coordinates: [parseFloat(listingData.location.coordinates[0]), parseFloat(listingData.location.coordinates[1])]
        };
    }

    const newListing = new listingModel(listingData);
    await newListing.save();
    return newListing;
}));


router.get('/', errorMiddleware(async (req, res) => {
    const listings = listingModel.find();

    return listings;

}));
module.exports = router;