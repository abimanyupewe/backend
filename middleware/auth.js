import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {
    const rawToken = req.headers.token || (req.headers.authorization && req.headers.authorization.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);
    if (!rawToken) {
        return res.json({success: false, message: 'Not Authorized Login Again'})
    }

    try {
        const token_decode = jwt.verify(rawToken, process.env.JWT_SECRET);
        if (!req.body) req.body = {};
        req.body.userId = token_decode.id;
        req.userId = token_decode.id;
        next()
    } catch (error) {
        console.log(error);
        res.json({success : false, message: error.message})
        
    }
}

export default authUser