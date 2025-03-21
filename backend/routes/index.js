const express = require('express');
const errorMiddleware = require('../middleware/errorMiddleware');
const ApiError = require('../errors/ApiError');
const validationMiddleware = require('../middleware/validationMiddleware');
const userValidation = require('../validationSchemas/userValidation');
const user = require('../controller/userController');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const session = require('express-session');

const User = require('../models/userModel');
const ApiResponse = require('../utils/ApiResponse');
const { sendEmail } = require('../utils/sendMail');
const {  FORGOTPASSWORD } = require('../static/mail');


router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

router.use(passport.initialize());
router.use(passport.session());

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

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const existingUser = await User.findOne({ googleId: profile.id });

            if (existingUser) {
                console.log("new user==========")
                const token = jwt.sign({ userId: existingUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                return done(null, { user: existingUser, token });
            } else {
                console.log(profile, "=======================================")
                const newUser = new User({
                    googleId: profile.id,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName || profile.name.givenName,
                    email: profile.emails ? profile.emails[0].value : null,
                    role:"user"
                });

                const savedUser = await newUser.save();
                const token = jwt.sign({ userId: savedUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                return done(null, { user: savedUser, token });
            }
        } catch (error) {
            console.error("Error in Google Strategy:", error);
            return done(error);
        }
    }
));

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.json({

            name: req.user.user.displayName,
            email: req.user.user.email,

        });
    });

router.post('/login', errorMiddleware(async (req, res) => {
    console.log(req.body)


    const data = await User.findOne({ email: req.body.email });
    console.log(data)
    if(!data){
        throw ApiError.notFound("user not found with "+req.body.email)
    }
    if (data.password == req.body.password) {
        return { email: data.email, name: data.firstName }
    } else {
        throw ApiError.badRequest("you have entered wrong credentials")
    }
}))

router.post('/signup', errorMiddleware(async (req, res) => {
    req.body.firstName = req.body.name;
    const data = await User.findOne({ email: req.body.email });
    if (!req.body.role) {
        req.body.role = "user";
    }
    if (data) {
        throw ApiError.badRequest("user already exiest with " + req.body.email)

    }
    const responce = await User.create(req.body);
    responce.name = responce.firstName;
    console.log(responce)
    return {
        email: responce.email, name: responce.firstName
    }
}))





router.post('/forgot-password', errorMiddleware(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        throw ApiError.notFound("User not found with email" + email);
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    await sendEmail(email, "reset your password for rentrealm", FORGOTPASSWORD(token))
    return { message: "Link has been sent to your email address." }
}));


router.post('/reset-password', errorMiddleware(async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token) {
        throw ApiError.badRequest("Invalid or Expired token!")
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
        throw ApiError.badRequest("Invalid or Expired token!")
    }

    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(newPassword, salt);

    // user.password = hashedPassword;
    user.password = newPassword;
    await user.save();

    return { message: "Password has been updated successfully" }

}));


module.exports = router;