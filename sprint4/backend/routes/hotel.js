const express = require('express');
const errorMiddleware = require('../middleware/errorMiddleware');
const ApiError = require('../errors/ApiError');
const router = express.Router();
const User = require('../models/userModel');
const ApiResponse = require('../utils/ApiResponse');
const hotelModel = require('../models/hotelModel');
const roomModel = require('../models/roomModel');
const bookingModel = require('../models/bookingModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const verifyToken = require('../middleware/authMiddleware');
const { json } = require('stream/consumers');




// Configure multer for hotel images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads/hotels/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Store the generated filename in req.generatedFilenames for later use
        const filename = 'hotel-' + uniqueSuffix + path.extname(file.originalname);
        if (!req.generatedFilenames) {
            req.generatedFilenames = {};
        }
        if (!req.generatedFilenames[file.fieldname]) {
            req.generatedFilenames[file.fieldname] = [];
        }
        req.generatedFilenames[file.fieldname].push(filename);
        cb(null, filename);
    }
});

// File filter for images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Only image files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
}).fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'images', maxCount: 5 }
]);




router.get('/my-hotels', verifyToken, errorMiddleware(async (req, res) => {
        const hotels = await hotelModel.find({ owner: req.user._id })
            .populate('rooms')
            .sort('-createdAt');

        return hotels;
   
}));

// Get all hotels with filters
router.get('/', errorMiddleware(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sort = '-createdAt',
        city,
        amenities,
        roomTypes
    } = req.query;

    const query = {};

    if (city) {
        query['address.city'] = new RegExp(city, 'i');
    }

    if (amenities) {
        query.amenities = {
            $all: Array.isArray(amenities) ? amenities : [amenities]
        };
    }

    query.rooms
    // First find hotels that match basic criteria
    let hotels = await hotelModel.find({ ...query, $expr: { $gt: [{ $size: "$rooms" }, 0] } })
        .populate('amenities', 'name icon')
        .populate('owner', 'name email')
        .populate('rooms')
        .sort(sort);

    console.log("hotels", hotels)
    // Filter by room types and price if specified
    if (roomTypes) {
        hotels = hotels.filter(hotel => {
            const hasMatchingRooms = hotel.rooms.some(room => {
                const matchesType = !roomTypes ||
                    (Array.isArray(roomTypes) ? roomTypes.includes(room.type) : room.type === roomTypes);
                return matchesType;
            });
            return hasMatchingRooms;
        });
    }

    // Handle pagination after filtering
    const total = hotels.length;
    const startIndex = (page - 1) * limit;
    const paginatedHotels = hotels.slice(startIndex, startIndex + parseInt(limit));

    // Transform the response to include full image URLs
    const transformedHotels = paginatedHotels.map(hotel => {
        const hotelObj = hotel.toObject();

        // Transform hotel images
        if (hotelObj.mainImage) {
            hotelObj.mainImage = `/hotels/${hotelObj.mainImage}`;
        }
        if (hotelObj.images && hotelObj.images.length > 0) {
            hotelObj.images = hotelObj.images.map(img => `/hotels/${img}`);
        }

        // Transform amenity icons
        if (hotelObj.amenities) {
            hotelObj.amenities = hotelObj.amenities.map(amenity => ({
                ...amenity,
                icon: amenity.icon ? `/amenities/${amenity.icon}` : null
            }));
        }

        // Transform room images if rooms exist
        if (hotelObj.rooms && hotelObj.rooms.length > 0) {
            hotelObj.rooms = hotelObj.rooms.map(room => ({
                ...room,
                images: room.images ? room.images.map(img => `/rooms/${img}`) : []
            }));
        }

        return hotelObj;
    });

    return {
        hotels: transformedHotels,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        }
    };
}));

// Get hotel by ID
router.get('/:hotelId', errorMiddleware(async (req, res) => {
    const hotel = await hotelModel.findById(req.params.hotelId)
        .populate('amenities', 'name icon')
        .populate('owner', 'name email')
        .populate({
            path: 'rooms',
            populate: {
                path: 'amenities',
            },
        });

    if (!hotel) {
        throw new ApiError(404, 'Hotel not found');
    }

    // Transform the response to include full image URLs
    const hotelObj = hotel.toObject();

    // Transform hotel images
    if (hotelObj.mainImage) {
        hotelObj.mainImage = `/hotels/${hotelObj.mainImage}`;
    }
    if (hotelObj.images && hotelObj.images.length > 0) {
        hotelObj.images = hotelObj.images.map(img => `/hotels/${img}`);
    }

    // Transform amenity icons
    if (hotelObj.amenities) {
        hotelObj.amenities = hotelObj.amenities.map(amenity => ({
            ...amenity,
            icon: amenity.icon ? `/${amenity.icon}` : null
        }));
    }

    // Transform room images if rooms exist
    if (hotelObj.rooms && hotelObj.rooms.length > 0) {
        hotelObj.rooms = hotelObj.rooms.map(room => ({
            ...room,
            images: room.images ? room.images.map(img => `/rooms/${img}`) : []
        }));
    }

    return hotelObj;
}));

const consoleHotel = (req, res, next) => {
    console.log("==========hotel==================", req.body)
    next();
}

router.use(consoleHotel)
// Add new hotel
router.post('/', verifyToken, consoleHotel, (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return next(new ApiError(400, `Upload error: ${err.message}`));
        } else if (err) {
            return next(err);
        }
        next();
    });
}, errorMiddleware(async (req, res) => {
    const hotelData = { ...req.body };
    console.log("before parse", hotelData)
    // Handle location data
    if (typeof req.body.location === 'string') {
        hotelData.location = JSON.parse(req.body.location);
    }

    // Handle amenities
    if (typeof req.body.amenities === 'string') {
        hotelData.amenities = req.body.amenities.split(',');
    }
    if (typeof req.body.address === 'string') {
        hotelData.address = JSON.parse(req.body.address);
    }
    // Handle files using the stored filenames
    if (req.files) {
        if (req.files.mainImage) {
            hotelData.mainImage = req.files.mainImage[0].filename;
        }
        if (req.files.images) {
            hotelData.images = req.files.images.map(file => file.filename);
        }
    }

    hotelData.owner = req.user._id;

    // Ensure location is in correct GeoJSON format
    if (hotelData.location && Array.isArray(hotelData.location.coordinates)) {
        hotelData.location = {
            type: 'Point',
            coordinates: [
                parseFloat(hotelData.location.coordinates[0]),
                parseFloat(hotelData.location.coordinates[1])
            ]
        };
    }

    // Set default location if not provided
    if (!hotelData.location) {
        hotelData.location = {
            type: 'Point',
            coordinates: [0, 0] // Default coordinates
        };
    }

    // Log the data before saving
    console.log('Hotel Data before save:', {
        ...hotelData,
        files: req.files // Log files information
    });
    console.log("after parse", hotelData)

    const hotel = new hotelModel(hotelData);
    await hotel.save();

    // Transform the response to include full image URLs
    const response = hotel.toObject();
    if (response.mainImage) {
        response.mainImage = `/uploads/hotels/${response.mainImage}`;
    }
    if (response.images && response.images.length > 0) {
        response.images = response.images.map(img => `/uploads/hotels/${img}`);
    }

    return response;
}));

// Update hotel
router.put('/:hotelId', verifyToken, (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return next(new ApiError(400, `Upload error: ${err.message}`));
        } else if (err) {
            return next(err);
        }
        next();
    });
}, errorMiddleware(async (req, res) => {
    const hotel = await hotelModel.findOne({
        _id: req.params.hotelId,
        owner: req.user._id
    });

    if (!hotel) {
        throw new ApiError(404, 'Hotel not found or unauthorized');
    }

    const updates = { ...req.body };
    console.log(updates, "=====updates=========")
    // Handle location data
    if (typeof req.body.location === 'string') {
        updates.location = JSON.parse(req.body.location);
    }
    if (typeof req.body.address === 'string') {
        updates.address = JSON.parse(req.body.address);
    }

    if (typeof req.body.amenities === 'string') {
        updates.amenities = req.body.amenities.split(',');
    }

    // Handle files
    if (req.files) {
        if (req.files.mainImage) {
            // Delete old main image
            if (hotel.mainImage) {
                const oldPath = path.join('./uploads/hotels/', hotel.mainImage);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            updates.mainImage = req.files.mainImage[0].filename;
        }
        if (req.files.images) {
            // Delete old additional images
            hotel.images.forEach(image => {
                const oldPath = path.join('./uploads/hotels/', image);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            });
            updates.images = req.files.images.map(file => file.filename);
        }
    }

    Object.assign(hotel, updates);
    await hotel.save();

    // Transform the response to include full image URLs
    const response = hotel.toObject();
    if (response.mainImage) {
        response.mainImage = `/uploads/hotels/${response.mainImage}`;
    }
    if (response.images && response.images.length > 0) {
        response.images = response.images.map(img => `/uploads/hotels/${img}`);
    }

    return response;
}));

// Delete hotel
router.delete('/:hotelId', verifyToken, errorMiddleware(async (req, res) => {
    const hotel = await hotelModel.findOne({
        _id: req.params.hotelId,
        owner: req.user._id
    });

    if (!hotel) {
        throw new ApiError(404, 'Hotel not found or unauthorized');
    }

    // Delete all associated images
    if (hotel.mainImage) {
        const mainImagePath = path.join('./uploads/hotels/', hotel.mainImage);
        if (fs.existsSync(mainImagePath)) fs.unlinkSync(mainImagePath);
    }

    hotel.images.forEach(image => {
        const imagePath = path.join('./uploads/hotels/', image);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    });

    await hotelModel.deleteOne({ _id: hotel._id });

    return { message: 'Hotel deleted successfully' };
}));

// Get all bookings for a user
router.get('/my/bookings', verifyToken, errorMiddleware(async (req, res) => {
    const bookings = await bookingModel.find({ user: req.user._id })
        .populate('user', 'name email')
        .populate('room')
        .populate({
            path: 'room',
            populate: {
                path: 'hotel',
                select: 'name address'
            }
        });

    return bookings;
}));

module.exports = router;