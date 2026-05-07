import jsonwebtoken from 'jsonwebtoken';

export const generateToken = (userId) => {  
    return jsonwebtoken.sign(   
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

export const verifyToken = (token) => {
    try {
        return jsonwebtoken.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw new Error('Invalid token');
    }
};

