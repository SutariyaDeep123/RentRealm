const ApiResponse = require('../utils/ApiResponse');

function errorMiddleware(handler) {
  return async (req, res, next) => {
    try {
      const result = await handler(req, res, next);
      res.json(new ApiResponse(result));
    } catch (error) {
      next(error);
    }
  };
}

module.exports = errorMiddleware;
