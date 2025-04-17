class ApiError {
  constructor(status, message = 'An unexpected error occurred', subErrors = []) {
    this.status = status;
    this.message = message;
    this.subErrors = subErrors;
  }

  static badRequest(msg, subErrors) {
    return new ApiError(400, msg || 'Bad Request', subErrors);
  }

  static notFound(msg) {
    return new ApiError(404, msg || 'Page Not Found');
  }

  static conflict(msg) {
    return new ApiError(409, msg || 'Conflict Occurred');
  }

  static internal(msg) {
   
     return new ApiError(500, msg || 'Internal Server Error');
    
   
  }
}

module.exports = ApiError;
