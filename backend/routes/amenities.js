const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const verifyToken = require('../middleware/authMiddleware');
const errorMiddleware = require('../middleware/errorMiddleware');
const ApiError = require('../errors/ApiError');
const Amenity = require('../models/amenityModel');

// Configure multer for SVG upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads/amenities/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'amenity-' + uniqueSuffix + '.svg');
    }
});

// File filter to only allow SVG files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/svg+xml') {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Only SVG files are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 // 1MB limit
    }
}).single('icon');

// Middleware to check if user is admin
const isAdmin = errorMiddleware(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        throw new ApiError(403, 'Access denied. Admin only.');
    }
    next();
});

// Add new amenity (admin only)
router.post('/', verifyToken, (req, res, next) => {
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            next(new ApiError(400, `Upload error: ${err.message}`));
            return;
        } else if (err) {
            next(err);
            return;
        }
        next();
    });
}, errorMiddleware(async (req, res) => {
    const { name } = req.body;
    
    if (!req.file) {
        throw new ApiError(400, 'Icon file is required');
    }

    const amenity = new Amenity({
        name,
        icon: req.file.filename
    });

    await amenity.save();
    return amenity;
}));

// Get all amenities
router.get('/', errorMiddleware(async (req, res) => {
    const amenities = await Amenity.find();
    return amenities.map(amenity => ({
        id: amenity._id,
        name: amenity.name,
        icon: `/amenities/${amenity.icon}`,
        createdAt: amenity.createdAt
    }));
}));

// Update amenity (admin only)
router.put('/:id', verifyToken, isAdmin, (req, res, next) => {
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            next(new ApiError(400, `Upload error: ${err.message}`));
            return;
        } else if (err) {
            next(err);
            return;
        }
        next();
    });
}, errorMiddleware(async (req, res) => {
    const { name } = req.body;
    const amenityId = req.params.id;

    const amenity = await Amenity.findById(amenityId);
    if (!amenity) {
        throw new ApiError(404, 'Amenity not found');
    }

    // If new icon is uploaded, delete old one
    if (req.file) {
        const oldIconPath = path.join('./uploads/amenities/', amenity.icon);
        if (fs.existsSync(oldIconPath)) {
            fs.unlinkSync(oldIconPath);
        }
        amenity.icon = req.file.filename;
    }

    if (name) {
        amenity.name = name;
    }

    await amenity.save();
    return {
        id: amenity._id,
        name: amenity.name,
        icon: `/uploads/amenities/${amenity.icon}`,
        createdAt: amenity.createdAt
    };
}));

// Delete amenity (admin only)
router.delete('/:id', verifyToken, isAdmin, errorMiddleware(async (req, res) => {
    const amenity = await Amenity.findById(req.params.id);
    if (!amenity) {
        throw new ApiError(404, 'Amenity not found');
    }

    // Delete icon file
    const iconPath = path.join('./uploads/amenities/', amenity.icon);
    if (fs.existsSync(iconPath)) {
        fs.unlinkSync(iconPath);
    }

    await Amenity.deleteOne({ _id: amenity._id });
    return { message: 'Amenity deleted successfully' };
}));

module.exports = router; 