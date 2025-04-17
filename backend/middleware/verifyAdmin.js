const ApiError = require("../errors/ApiError");

const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        throw new ApiError(403, 'No token provided');
    }
}
module.exports = {verifyAdmin};