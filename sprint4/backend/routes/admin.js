const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const errorMiddleware = require('../middleware/errorMiddleware');
const ApiError = require('../errors/ApiError');
const verifyToken = require('../middleware/authMiddleware');
const { verifyAdmin } = require('../middleware/verifyAdmin');
const bookingModel = require('../models/bookingModel');


router.get('/users', verifyToken, verifyAdmin, errorMiddleware(async (req, res) => {
    // Parse query parameters with defaults
    const page = parseInt(req.query.page) || 1; // default to page 1
    const limit = parseInt(req.query.limit) || 10; // default limit to 10

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count of users for pagination info
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Query with pagination
    const users = await User.find({ role: 'user' })
        .skip(skip)
        .limit(limit);

    if (!users || users.length === 0) {
        throw new ApiError(404, 'No users found');
    }

    // Return paginated response
    return {
        users,
        pagination: {
            total: totalUsers,
            page,
            limit,
            totalPages: Math.ceil(totalUsers / limit),
            hasNextPage: (page * limit) < totalUsers,
            hasPreviousPage: page > 1
        }
    }
}));

router.delete('/users/:id', verifyToken, verifyAdmin, errorMiddleware(async (req, res) => {

    const userId = req.params.id;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
        throw new ApiError(404, 'User not found');
    }
    return deletedUser;
}
));


router.get('/dashboard/users', verifyToken, verifyAdmin, errorMiddleware(async (req, res) => {
    const { year } = req.query;
    console.log(year);
    console.log(req.query)
    const targetYear = year || new Date().getFullYear();
    console.log(targetYear, "========");
    const registrations = await User.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(`${targetYear}-01-01`),
                    $lt: new Date(`${targetYear + 1}-01-01`)
                }
            }
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                month: "$_id",
                count: 1
            }
        },
        {
            $sort: { month: 1 }
        }
    ]);

    // Convert to complete year format
    const result = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        count: (registrations.find(r => r.month === i + 1)?.count) || 0
    }));
    console.log(result, "=========");
    return { users: { year: targetYear, registrations: result } };

}));

router.get('/dashboard/bookings', verifyToken, verifyAdmin, errorMiddleware(async (req, res) => {

    const { year } = req.body;
    const targetYear = year || new Date().getFullYear();

    // MongoDB aggregation pipeline
    const bookings = await bookingModel.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(`${targetYear}-01-01`),
                    $lt: new Date(`${targetYear + 1}-01-01`)
                }
            }
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                month: "$_id",
                count: 1
            }
        },
        {
            $sort: { month: 1 }
        }
    ]);

    // Create a complete array for all months (1-12) with zero counts for missing months
    const result = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        count: (bookings.find(b => b.month === i + 1)?.count) || 0
    }));

    return { bookings: { year: targetYear, bookingsByMonth: result } };
}
));
module.exports = router;