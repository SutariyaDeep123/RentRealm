const jwt = require('jsonwebtoken');
const ApiError = require('../errors/ApiError');
const User = require('../models/userModel');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, 'No token provided');
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.userId);
        if (!user) {
            throw new ApiError(401, 'User not found');
        }

        req.user = user;
        console.log(user,"+==============")
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            next(new ApiError(401, 'Invalid token'));
            return;
        }
        if (error.name === 'TokenExpiredError') {
            next(new ApiError(401, 'Token expired'));
            return;
        }
        next(error);
    }
};

module.exports = verifyToken;