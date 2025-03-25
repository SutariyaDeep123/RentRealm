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



module.exports = router;