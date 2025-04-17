const { body, validationResult } = require("express-validator");
const ApiError = require("../errors/ApiError");

const validationMiddleware = () => (req, res, next) => {

  const result = validationResult(req)
  console.log(result.errors)

  if (!result.isEmpty()) {
    const validationErrors = result.array().map((err) => `${err.path} ${err.msg}`);
    next(ApiError.badRequest(null, validationErrors));
  } else {
    next();
  }
};

module.exports = validationMiddleware;