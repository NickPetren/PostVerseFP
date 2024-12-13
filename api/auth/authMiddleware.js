import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        console.log('Auth debug:', {
            authHeader: req.headers.authorization,
            token: token
        });

        if (!token) {
            return res.status(401).json({ message: 'No authorization token' });
        }

        const decoded = jwt.verify(token, 'your-secret-key-123');
        console.log('Decoded token:', decoded);
        
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ 
            message: 'Invalid token',
            error: error.message 
        });
    }
};