const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * 
 * Verifies the JWT from the Authorization header and attaches the user payload to the request.
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. no token provided.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'STATIONS_DEFAULT_SECRET');
        req.user = verified;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
}

/**
 * Role Authorization Middleware
 * 
 * Checks if the authenticated user has the required role to access a route.
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 */
function authorizeRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Permission denied. insufficient privileges.' });
        }

        next();
    };
}

module.exports = {
    authenticateToken,
    authorizeRole
};
