const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const verifyToken = require('../middleware/authMiddleware');
const errorMiddleware = require('../middleware/errorMiddleware');
const ApiError = require('../errors/ApiError');
const Room = require('../models/roomModel');
const Hotel = require('../models/hotelModel');

// Configure multer for room images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads/rooms/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'room-' + uniqueSuffix + path.extname(file.originalname));
    }
});

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
}).array('images', 5); // Allow up to 5 images

// Add new room
router.post('/:hotelId', verifyToken, (req, res, next) => {
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            return next(new ApiError(400, `Upload error: ${err.message}`));
        } else if (err) {
            return next(err);
        }
        next();
    });
}, errorMiddleware(async (req, res) => {
    const hotelId = req.params.hotelId;
    
    // Check if hotel exists and user owns it
    const hotel = await Hotel.findOne({ 
        _id: hotelId,
        owner: req.user._id 
    });

    if (!hotel) {
        throw new ApiError(404, 'Hotel not found or unauthorized');
    }

    const roomData = {
        ...req.body,
        hotel: hotelId
    };
console.log(roomData)
    // Handle images
    if (req.files && req.files.length > 0) {
        roomData.images = req.files.map(file => file.filename);
    }

    // Validate room type
    if (!['single', 'double', 'suite'].includes(roomData.type)) {
        throw new ApiError(400, 'Invalid room type. Must be single, double, or suite');
    }

    // Validate price
    if (!roomData.price || isNaN(roomData.price)) {
        throw new ApiError(400, 'Valid price is required');
    }

    // Handle amenities if provided
    if (typeof req.body.amenities === 'string') {
        roomData.amenities = JSON.parse(req.body.amenities);
    }

    try {
        // Create new room
        const room = new Room(roomData);
        await room.save();

        // Add room ID to hotel's rooms array
        hotel.rooms.push(room._id);
        await hotel.save();

        // Transform the response to include full image URLs
        const response = room.toObject();
        if (response.images && response.images.length > 0) {
            response.images = response.images.map(img => `/uploads/rooms/${img}`);
        }

        return response;
    } catch (error) {
        // If room creation fails, delete any uploaded images
        if (req.files) {
            req.files.forEach(file => {
                const filePath = path.join('./uploads/rooms/', file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }
        throw error;
    }
}));

// Get rooms by hotel
router.get('/hotel/:hotelId', errorMiddleware(async (req, res) => {
    const rooms = await Room.find({ hotel: req.params.hotelId });
    
    // Transform the response to include full image URLs
    const response = rooms.map(room => {
        const roomObj = room.toObject();
        if (roomObj.images && roomObj.images.length > 0) {
            roomObj.images = roomObj.images.map(img => `/rooms/${img}`);
        }
        return roomObj;
    });

    return response;
}));

// Update room
router.put('/:roomId', verifyToken, (req, res, next) => {
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            return next(new ApiError(400, `Upload error: ${err.message}`));
        } else if (err) {
            return next(err);
        }
        next();
    });
}, errorMiddleware(async (req, res) => {
    // First find the room and check ownership
    const room = await Room.findById(req.params.roomId);
    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    const hotel = await Hotel.findOne({
        _id: room.hotel,
        owner: req.user._id
    });

    if (!hotel) {
        throw new ApiError(403, 'Unauthorized to modify this room');
    }

    const updates = { ...req.body };

    // Handle images
    if (req.files && req.files.length > 0) {
        // Delete old images
        room.images.forEach(image => {
            const imagePath = path.join('./uploads/rooms/', image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        });
        updates.images = req.files.map(file => file.filename);
    }

    // Handle amenities if provided
    if (typeof req.body.amenities === 'string') {
        updates.amenities = JSON.parse(req.body.amenities);
    }

    Object.assign(room, updates);
    await room.save();

    // Transform the response to include full image URLs
    const response = room.toObject();
    if (response.images && response.images.length > 0) {
        response.images = response.images.map(img => `/rooms/${img}`);
    }

    return response;
}));

// Delete room
router.delete('/:roomId', verifyToken, errorMiddleware(async (req, res) => {
    // First find the room and check ownership
    const room = await Room.findById(req.params.roomId);
    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    const hotel = await Hotel.findOne({
        _id: room.hotel,
        owner: req.user._id
    });

    if (!hotel) {
        throw new ApiError(403, 'Unauthorized to delete this room');
    }

    // Delete all associated images
    room.images.forEach(image => {
        const imagePath = path.join('./uploads/rooms/', image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    });

    // Remove room ID from hotel's rooms array
    hotel.rooms = hotel.rooms.filter(roomId => roomId.toString() !== room._id.toString());
    await hotel.save();

    await Room.deleteOne({ _id: room._id });

    return { message: 'Room deleted successfully' };
}));

// Get all hotels with filters
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

    try {
        // Build the base query
        let query = {};

        if (city) {
            query['address.city'] = new RegExp(city, 'i');
        }

        if (amenities) {
            query.amenities = { 
                $all: Array.isArray(amenities) ? amenities : [amenities] 
            };
        }

        // First, find hotels that match the room criteria
        if (roomTypes || minPrice || maxPrice) {
            // Find matching rooms first
            const roomQuery = {};
            
            if (roomTypes) {
                roomQuery.type = Array.isArray(roomTypes) 
                    ? { $in: roomTypes }
                    : roomTypes;
            }

            if (minPrice || maxPrice) {
                roomQuery.price = {};
                if (minPrice) roomQuery.price.$gte = parseFloat(minPrice);
                if (maxPrice) roomQuery.price.$lte = parseFloat(maxPrice);
            }

            // Find rooms that match criteria
            const matchingRooms = await Room.find(roomQuery);
            
            // Get hotel IDs from matching rooms
            const hotelIds = [...new Set(matchingRooms.map(room => room.hotel))];
            
            // Add hotel IDs to main query
            query._id = { $in: hotelIds };
        }

        // Get total count for pagination
        const total = await Hotel.countDocuments(query);

        // Get paginated results with populated fields
        const hotels = await Hotel
            .find(query)
            .populate('amenities', 'name icon')
            .populate('owner', 'name email')
            .populate({
                path: 'rooms',
                select: 'type price images amenities',
                match: roomTypes || minPrice || maxPrice ? {
                    $and: [
                        roomTypes ? { type: { $in: Array.isArray(roomTypes) ? roomTypes : [roomTypes] } } : {},
                        minPrice ? { price: { $gte: parseFloat(minPrice) } } : {},
                        maxPrice ? { price: { $lte: parseFloat(maxPrice) } } : {}
                    ]
                } : {}
            })
            .sort(sort)
            .skip((page - 1) * parseInt(limit))
            .limit(parseInt(limit));

        // Transform response to include full image URLs and calculate min/max room prices
        const transformedHotels = hotels.map(hotel => {
            const hotelObj = hotel.toObject();
            
            // Transform hotel images
            if (hotelObj.mainImage) {
                hotelObj.mainImage = `/uploads/hotels/${hotelObj.mainImage}`;
            }
            if (hotelObj.images && hotelObj.images.length > 0) {
                hotelObj.images = hotelObj.images.map(img => `/uploads/hotels/${img}`);
            }

            // Calculate min/max room prices
            if (hotelObj.rooms && hotelObj.rooms.length > 0) {
                const prices = hotelObj.rooms.map(room => room.price);
                hotelObj.minPrice = Math.min(...prices);
                hotelObj.maxPrice = Math.max(...prices);
                
                // Transform room images
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
                pages: Math.ceil(total / parseInt(limit))
            }
        };

    } catch (error) {
        console.error('Error in hotel filtering:', error);
        throw new ApiError(500, 'Error filtering hotels');
    }
}));

// Get room by ID
router.get('/:roomId', errorMiddleware(async (req, res) => {
    const room = await Room.findById(req.params.roomId)
        .populate('hotel', 'name address mainImage').populate('amenities')
    
    if (!room) {
        throw new ApiError(404, 'Room not found');
    }
    
    // Transform the response to include full image URLs
    const roomObj = room.toObject();

    // Transform room images
    if (roomObj.images && roomObj.images.length > 0) {
        roomObj.images = roomObj.images.map(img => `/rooms/${img}`);
    }

    // Transform hotel main image if exists
    if (roomObj.hotel && roomObj.hotel.mainImage) {
        roomObj.hotel.mainImage = `/hotels/${roomObj.hotel.mainImage}`;
    }

    
    return roomObj;
}));

module.exports = router; 