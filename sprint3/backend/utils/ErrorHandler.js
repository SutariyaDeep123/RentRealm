const ApiError = require('../errors/ApiError');
const ApiResponse = require('./ApiResponse');

class ErrorHandler {
  static handleError(err, req, res, next) {
    if (err instanceof ApiError) {
      return res.status(err.status).json(new ApiResponse(null, err));
    }
    
    // Handle validation errors (assuming you're using express-validator)
    if (err.array && typeof err.array === 'function') {
      const validationErrors = err.array().map(error => error.msg);
      const apiError = new ApiError(400, 'Input validation failed', validationErrors);
      return res.status(400).json(new ApiResponse(null, apiError));
    }
    
    // Default to 500 server error
    let internalError;
    if (process.env.environment == 'development') {
      console.log(err)
      internalError = new ApiError(err.message, err.stack);
    } else {
      
      internalError = ApiError.internal('Something went wrong');
    }
    res.status(500).json(new ApiResponse(null, internalError));
  }
}

module.exports = ErrorHandler;
