const express = require('express');
const router = express.Router();
const errorMiddleware = require('../middleware/errorMiddleware');
const ApiError = require('../errors/ApiError');
const Booking = require('../models/bookingModel');
const Hotel = require('../models/hotelModel');
const Room = require('../models/roomModel');
const Listing = require('../models/listingModel');
const verifyToken = require('../middleware/authMiddleware');
const { sendEmail } = require('../utils/sendMail');
const { invoiceEmail } = require('../static/mail');
const userModel = require('../models/userModel');

// Book a hotel room
router.post('/hotel', verifyToken, errorMiddleware(async (req, res) => {
    const {
        hotelId,
        roomId,
        checkIn,
        checkOut,
        guestCount,
        specialRequests
    } = req.body;

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
        throw new ApiError(400, 'Check-out date must be after check-in date');
    }
    console.log(req.body)
    // Check if room exists and is available
    const room = await Room.findById(roomId).populate('hotel');
    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    if (room.hotel._id.toString() !== hotelId) {
        throw new ApiError(400, 'Room does not belong to specified hotel');
    }

    // Check for existing bookings in the date range
    const existingBooking = await Booking.findOne({
        room: roomId,
        status: { $ne: 'cancelled' },
        $or: [
            {
                checkIn: { $lte: checkOutDate },
                checkOut: { $gte: checkInDate }
            }
        ]
    });

    if (existingBooking) {
        throw new ApiError(400, 'Room is not available for the selected dates');
    }

    // Calculate total price (number of nights * room price)
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * room.price;

    const booking = new Booking({
        user: req.user._id,
        bookingType: 'hotel',
        room: roomId,
        hotel: hotelId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
        guestCount,
        specialRequests,
        status: 'confirmed'
    });

    await booking.save();

    console.log("sending email")
    const user = await userModel.findById(req.user._id); // add if not already fetched
    await sendEmail(user.email, "Your invoice", invoiceEmail(user, booking, 'hotel'));

    return {
        message: 'Booking confirmed successfully',
        booking: await booking.populate([
            { path: 'hotel', select: 'name address' },
            { path: 'room', select: 'type price' },
            { path: 'user', select: 'name email' }
        ])
    }
}));
// In your booking route
router.post('/listing', verifyToken, errorMiddleware(async (req, res) => {
    const {
        listingId,
        checkIn,
        checkOut,
        guestCount,
        specialRequests
    } = req.body;

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
        throw new ApiError(404, 'Listing not found');
    }

    // Handle sale listings differently
    if (listing.type === 'sale') {
        // Check if listing is already sold
        if (!listing.isAvailable) {
            throw new ApiError(400, 'This property has already been sold');
        }

        const booking = new Booking({
            user: req.user._id,
            bookingType: 'listing',
            listing: listingId,
            checkIn: new Date(),
            checkOut: new Date(),
            totalPrice: listing.price,
            guestCount: 1, // Default for sales
            specialRequests,
            status: 'confirmed'
        });

        await booking.save();

        // Mark listing as sold
        listing.isAvailable = false;
        await listing.save();

        return {
            message: 'Purchase confirmed successfully',
            booking: await booking.populate([
                { path: 'listing', select: 'name address price' },
                { path: 'user', select: 'name email' }
            ])
        }
    }

    // For rent and temporary_rent listings
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
        throw new ApiError(400, 'Check-out date must be after check-in date');
    }

    // Check for existing bookings in the date range
    const existingBooking = await Booking.findOne({
        listing: listingId,
        status: { $ne: 'cancelled' },
        $or: [
            {
                checkIn: { $lte: checkOutDate },
                checkOut: { $gte: checkInDate }
            }
        ]
    });

    if (existingBooking) {
        throw new ApiError(400, 'Listing is not available for the selected dates');
    }

    // Calculate total price (number of nights * listing price)
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * listing.price;

    const booking = new Booking({
        user: req.user._id,
        bookingType: 'listing',
        listing: listingId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
        guestCount,
        specialRequests,
        status: 'confirmed'
    });

    await booking.save();

    console.log("=====================sending email")
    const user = await userModel.findById(req.user._id); // add if not already fetched
    await sendEmail(user.email, "Your invoice", invoiceEmail(user, booking, 'listing'));

    return {
        message: 'Booking confirmed successfully',
        booking: await booking.populate([
            { path: 'listing', select: 'name address price' },
            { path: 'user', select: 'name email' }
        ])
    }
}));
// Get user's bookings (both hotels and listings)
router.get('/my-bookings', verifyToken, errorMiddleware(async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate('user', 'name email')
        .populate('hotel', 'name address')
        .populate('room', 'type price')
        .populate('listing', 'name address price')
        .sort('-createdAt');

    return bookings;
}));

// Get owner's property bookings
router.get('/property-bookings', verifyToken, errorMiddleware(async (req, res) => {
    // Get hotels owned by user
    const hotels = await Hotel.find({ owner: req.user._id });
    const hotelIds = hotels.map(hotel => hotel._id);

    // Get listings owned by user
    const listings = await Listing.find({ owner: req.user._id });
    const listingIds = listings.map(listing => listing._id);

    // Get all bookings for user's properties
    const bookings = await Booking.find({
        $or: [
            { hotel: { $in: hotelIds } },
            { listing: { $in: listingIds } }
        ]
    })
        .populate('user', 'name email')
        .populate('hotel', 'name address')
        .populate('room', 'type price')
        .populate('listing', 'name address price')
        .sort('-createdAt');

    return bookings;
}));

// Update booking status
router.patch('/:bookingId/status', verifyToken, errorMiddleware(async (req, res) => {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
        throw new ApiError(404, 'Booking not found');
    }

    // Verify ownership
    let isOwner = false;
    if (booking.bookingType === 'hotel') {
        const hotel = await Hotel.findById(booking.hotel);
        isOwner = hotel.owner.toString() === req.user._id.toString();
    } else {
        const listing = await Listing.findById(booking.listing);
        isOwner = listing.owner.toString() === req.user._id.toString();
    }

    if (!isOwner && booking.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'Unauthorized to update this booking');
    }

    booking.status = status;
    await booking.save();

    return {
        message: 'Booking status updated successfully',
        booking: await booking.populate([
            { path: 'user', select: 'name email' },
            { path: 'hotel', select: 'name address' },
            { path: 'room', select: 'type price' },
            { path: 'listing', select: 'name address price' }
        ])
    }
}));



// Update in booking.js
router.get('/check-availability', verifyToken, errorMiddleware(async (req, res) => {
    const {
        type,
        propertyId,
        roomId,
        checkIn,
        checkOut
    } = req.query;

    // Validate that both dates are provided
    if (!checkIn || !checkOut) {
        return new ApiError(400, 'Please provide both check-in and check-out dates');
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
        return new ApiError(400, 'Check-out date must be after check-in date');

    }

    if (type === 'hotel') {
        // Check if room exists
        const room = await Room.findById(roomId);
        if (!room) {
            return new ApiError(404, 'Room not found');
        }

        // Check for existing bookings in the date range
        const existingBooking = await Booking.findOne({
            room: roomId,
            status: { $ne: 'cancelled' },
            $or: [
                {
                    checkIn: { $lte: checkOutDate },
                    checkOut: { $gte: checkInDate }
                }
            ]
        });

        return {
            available: !existingBooking,
            message: existingBooking
                ? 'Room is not available for the selected dates'
                : 'Room is available'
        };
    } else {
        // For listings
        const listing = await Listing.findById(propertyId);
        if (!listing) {
            return new ApiError(404, 'Listing not found');
        }

        // Check for existing bookings in the date range
        const existingBooking = await Booking.findOne({
            listing: propertyId,
            status: { $ne: 'cancelled' },
            $or: [
                {
                    checkIn: { $lte: checkOutDate },
                    checkOut: { $gte: checkInDate }
                }
            ]
        });

        return {
            available: !existingBooking,
            message: existingBooking
                ? 'Property is not available for the selected dates'
                : 'Property is available'
        };
    }
}));

module.exports = router;