const jwt =require("jsonwebtoken");
const RedisClient = require("../config/redis")
const User = require("../models/user");

const userMiddleware = async (req,res,next)=>{
    try{
        const {token} = req.cookies;
        if(!token){
            throw new Error ("Token not present");
        }
        
        const payload = jwt.verify(token,process.env.JWT_KEY);
        const {_id}= payload;

        if(!_id){
            throw new Error("Invalid Token");
        }
        
        const result =await User.findById(_id);
        if(!result){
            throw new Error("User Dosen't Exists");
        }
        const isBlocked = await RedisClient.exists(`token:${token}`);
        if(isBlocked){
            throw new Error("Invalid Token");
        }
        console.log(result);
        req.result= result;
        next();
    }
    catch(err){
        res.status(401).send("Error "+err);
    }
}

module.exports = userMiddleware;
