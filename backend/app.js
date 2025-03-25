var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var propertyRouter = require('./routes/property');
var authRouter = require('./routes/auth');
var hotelRouter = require('./routes/hotel');
var amenitiesRouter = require('./routes/amenities');
var roomRouter = require('./routes/room');
var bookingRouter = require('./routes/booking');
const ErrorHandler = require('./utils/ErrorHandler');
const ApiError = require('./errors/ApiError');
const cors = require('cors');
var app = express();
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'uploads')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/listing', propertyRouter);
app.use('/auth', authRouter);
app.use('/hotels', hotelRouter);
app.use('/amenities', amenitiesRouter);
app.use('/rooms', roomRouter);
app.use('/booking', bookingRouter);

// catch 404 and forward to error handler
app.use("*",function(req, res, next) {
  next(ApiError.notFound());
});

app.use(ErrorHandler.handleError);


module.exports = app;
