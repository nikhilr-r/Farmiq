const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Make sure it's a farmer token
        if (!decoded.farmer) {
            return res.status(401).json({ msg: 'Not authorized as a farmer' });
        }

        req.farmer = decoded.farmer;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
