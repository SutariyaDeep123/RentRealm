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
const verifyToken = require('../middleware/authMiddleware');
const bookingModel = require('../models/bookingModel');

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
router.get('/my-listings', verifyToken, errorMiddleware(async (req, res) => {

    const listings = await listingModel.find({ owner: req.user._id });
    return { listings };

}));
// Get all listings with filters


// GET /listing/price-range
router.get('/price-range', errorMiddleware(async (req, res) => {
    const prices = await listingModel.aggregate([
        { $match: { isAvailable: true } },
        {
            $group: {
                _id: null,
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" }
            }
        }
    ]);

    const { minPrice = 0, maxPrice = 5000 } = prices[0] || {};

    return {
        minPrice,
        maxPrice
    }

}));

router.get('/', errorMiddleware(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sort = '-createdAt',
        city,
        minPrice,
        maxPrice,
        amenities,
        roomTypes
    } = req.query;

    const query = {};

    if (city) {
        query['address.city'] = new RegExp(city, 'i');
    }

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (amenities) {
        query.amenities = {
            $all: Array.isArray(amenities) ? amenities : [amenities]
        };
    }

    query.isAvailable = true;
    // First find listings that match basic criteria
    let listings = await listingModel.find(query)
        .populate('amenities', 'name icon')
        .populate('owner', 'name email')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    // Transform the response to include full image URLs
    const transformedListings = listings.map(listing => {
        const listingObj = listing.toObject();

        // Transform main image URL
        if (listingObj.mainImage) {
            listingObj.mainImage = `/${listingObj.mainImage}`;
        }

        // Transform additional images URLs
        if (listingObj.images && listingObj.images.length > 0) {
            listingObj.images = listingObj.images.map(img => `/${img}`);
        }

        // Transform amenity icons if they exist
        if (listingObj.amenities) {
            listingObj.amenities = listingObj.amenities.map(amenity => ({
                ...amenity,
                icon: amenity.icon ? `/amenities/${amenity.icon}` : null
            }));
        }

        return listingObj;
    });

    const total = await listingModel.countDocuments(query);
    console.log(total)
    console.log(listings)
    return {
        listings: transformedListings,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        }
    };
}));

// Add new listing
router.post('/', verifyToken, (req, res, next) => {
    upload.fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'additionalImages', maxCount: 5 }
    ])(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return next(new ApiError(400, `Upload error: ${err.message}`));
        } else if (err) {
            return next(err);
        }
        next();
    });
}, errorMiddleware(async (req, res) => {
    const listingData = { ...req.body };
    console.log(listingData)
    // Handle location data
    if (typeof req.body.location === 'string') {
        listingData.location = JSON.parse(req.body.location);
    }

    if (typeof req.body.amenities === 'string') {
        listingData.amenities = req.body.amenities.split(',');
    }

    if (typeof req.body.address === 'string') {
        listingData.address = JSON.parse(req.body.address);
    }

    if (typeof req.body.availability === 'string') {
        listingData.availability = JSON.parse(req.body.availability);
    }


    // Handle files
    if (req.files) {
        if (req.files.mainImage) {
            listingData.mainImage = req.files.mainImage[0].filename;
        }
        if (req.files.additionalImages) {
            listingData.images = req.files.additionalImages.map(file => file.filename);
        }
    }

    // Add owner
    listingData.owner = req.user._id;

    // Ensure location is in correct GeoJSON format
    if (listingData.location && Array.isArray(listingData.location.coordinates)) {
        listingData.location = {
            type: 'Point',
            coordinates: [
                parseFloat(listingData.location.coordinates[0]),
                parseFloat(listingData.location.coordinates[1])
            ]
        };
    }

    // Set default location if not provided
    if (!listingData.location) {
        listingData.location = {
            type: 'Point',
            coordinates: [0, 0] // Default coordinates
        };
    }
    console.log(listingData)
    const listing = new listingModel(listingData);
    await listing.save();

    // Transform the response to include full image URLs
    const response = listing.toObject();
    if (response.mainImage) {
        response.mainImage = `/${response.mainImage}`;
    }
    if (response.images && response.images.length > 0) {
        response.images = response.images.map(img => `/${img}`);
    }

    return response;
}));

// Get listing by ID
router.get('/:listingId', errorMiddleware(async (req, res) => {
    const listing = await listingModel.findById(req.params.listingId)
        .populate('amenities')
        .populate('owner');

    if (!listing) {
        throw new ApiError(404, 'Listing not found');
    }

    // Transform the response to include full image URLs
    const response = listing.toObject();
    if (response.mainImage) {
        response.mainImage = `/${response.mainImage}`;
    }
    if (response.images && response.images.length > 0) {
        response.images = response.images.map(img => `/${img}`);
    }

    return response;
}));

// Update listing
router.put('/:listingId', verifyToken, (req, res, next) => {
    upload.fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'additionalImages', maxCount: 5 }
    ])(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return next(new ApiError(400, `Upload error: ${err.message}`));
        } else if (err) {
            return next(err);
        }
        next();
    });
}, errorMiddleware(async (req, res) => {
    const listing = await listingModel.findOne({
        _id: req.params.listingId,
        owner: req.user._id
    });

    if (!listing) {
        throw new ApiError(404, 'Listing not found or unauthorized');
    }

    const updates = { ...req.body };

    // Handle location data
    if (typeof req.body.location === 'string') {
        updates.location = JSON.parse(req.body.location);
    }

    if (typeof req.body.address === 'string') {
        updates.address = JSON.parse(req.body.address);
    }

    if (typeof req.body.amenities === 'string') {
        updates.amenities = JSON.parse(req.body.amenities);
    }

    if (typeof req.body.availability === 'string') {
        updates.availability = JSON.parse(req.body.availability);
    }


    // Handle files
    if (req.files) {
        if (req.files.mainImage) {
            // Delete old main image
            if (listing.mainImage) {
                const oldPath = path.join('./uploads/', listing.mainImage);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            updates.mainImage = req.files.mainImage[0].filename;
        }
        if (req.files.additionalImages) {
            // Delete old additional images
            listing.images.forEach(image => {
                const oldPath = path.join('./uploads/', image);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            });
            updates.images = req.files.additionalImages.map(file => file.filename);
        }
    }

    Object.assign(listing, updates);
    await listing.save();

    // Transform the response to include full image URLs
    const response = listing.toObject();
    if (response.mainImage) {
        response.mainImage = `/uploads/${response.mainImage}`;
    }
    if (response.images && response.images.length > 0) {
        response.images = response.images.map(img => `/uploads/${img}`);
    }

    return response;
}));

// Delete listing
router.delete('/:listingId', verifyToken, errorMiddleware(async (req, res) => {
    const listing = await listingModel.findOne({
        _id: req.params.listingId,
        owner: req.user._id
    });

    if (!listing) {
        throw new ApiError(404, 'Listing not found or unauthorized');
    }

    // Delete all associated images
    if (listing.mainImage) {
        const mainImagePath = path.join('./uploads/', listing.mainImage);
        if (fs.existsSync(mainImagePath)) fs.unlinkSync(mainImagePath);
    }

    listing.images.forEach(image => {
        const imagePath = path.join('./uploads/', image);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    });

    await listingModel.deleteOne({ _id: listing._id });

    return { message: 'Listing deleted successfully' };
}));

router.get('/my/bookings', verifyToken, errorMiddleware(async (req, res) => {
    const bookings = await bookingModel.find({ user: req.user._id })
        .populate('user', 'name email')
        .populate('listing');

    return bookings;
}));



module.exports = router;