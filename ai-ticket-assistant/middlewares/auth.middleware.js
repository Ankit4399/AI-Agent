import jwt from 'jsonwebtoken';

export const auth = async(req,res,next)=>{
    const token = req.headers.Authorization?.split(" ")[1];
    if(!token){
        res.status(401).json({error : "token not found"})
    }
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded
        next(); 
    } catch (error) {
        res.status(500).json({error : "Invalid token"})
    }
};