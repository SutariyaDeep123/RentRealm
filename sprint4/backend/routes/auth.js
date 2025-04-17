const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const errorMiddleware = require('../middleware/errorMiddleware');
const ApiError = require('../errors/ApiError');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const { sendEmail } = require('../utils/sendMail');
const { FORGOTPASSWORD } = require('../static/mail');
const verifyToken = require('../middleware/authMiddleware');

// Configure session
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

router.use(passport.initialize());
router.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.FRONTEND_URL || 'http://localhost:5000/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user exists
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                // Update existing user's Google info
                user.googleId = profile.id;
                user.email = profile.emails[0].value;
                user.firstName = profile.displayName;
                await user.save();
            } else {
                // Create new user
                user = new User({
                    googleId: profile.id,
                    firstName: profile.displayName,
                    email: profile.emails[0].value,
                    role: 'user'
                });
                await user.save();
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            return done(null, { user, token });
        } catch (error) {
            return done(error);
        }
    }
));

// Regular login route
router.post('/login', errorMiddleware(async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(401, 'Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    // Return user data and token
    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        token
    };
}));

// Regular register route
router.post('/register', errorMiddleware(async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, 'User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
        firstName:name,
        email,
        password: hashedPassword,
        role: 'user'
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    // Return user data and token
    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        token
    };
}));

// Google auth routes
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
}));

router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/auth/login-failed',
        session: false 
    }),
    (req, res) => {
        // Return the same response format as regular login
        return res.json({
            user: {
                id: req.user.user._id,
                name: req.user.user.firstName,
                email: req.user.user.email,
                role: req.user.user.role
            },
            token: req.user.token
        });
    }
);

// Handle Google auth failure
router.get('/login-failed', (req, res) => {
    res.status(401).json({
        success: false,
        message: 'Google authentication failed'
    });
});

// Forgot password route
router.post('/forgot-password', errorMiddleware(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    // Send reset email
    await sendEmail(email, "Reset your password", FORGOTPASSWORD(token));
    
    return { message: "Password reset link has been sent to your email" };
}));

// Reset password route
router.post('/reset-password', errorMiddleware(async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token) {
        throw new ApiError(400, "Reset token is required");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return { message: "Password has been updated successfully" };
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(400, "Reset token has expired");
        }
        throw new ApiError(400, "Invalid reset token");
    }
}));



// Get user profile
router.get('/profile', verifyToken, errorMiddleware(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select('-password -googleId'); // Exclude sensitive fields
    
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            // Add any other profile fields you want to return
        }
    };
}));

// Update user profile
router.put('/profile', verifyToken, errorMiddleware(async (req, res) => {
    const { name, email } = req.body;
    
    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ApiError(400, 'Email already in use');
        }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { 
            $set: {
                name: name || req.user.name,
                email: email || req.user.email,
                // Add other updatable fields here
            }
        },
        { new: true }
    ).select('-password -googleId');

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            // Add any other profile fields you want to return
        }
    };
}));

// Change password
router.put('/change-password', verifyToken, errorMiddleware(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Check current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, 'Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return { message: 'Password updated successfully' };
}));


module.exports = router;