const redisClient = require("../config/redis");


const submitCodeRateLimiter =async(req,res,next)=>{
    const userId=req.result._id;
    const redisKey = `submit_cooldown:${userId}`;
    try{
        const exists = await redisClient.exists(redisKey);
        if(exists){
            return res.status(429).json({
                error:"please try after 10s before submitting again"
            })
        }
        await redisClient.set(redisKey,"cooldown_active",{
            EX:10,
            NX:true
        });
        next();
    }
    catch(err){
        console.error("Rate Limiter Error: "+ err);
        res.status(500).json({
            error:"Internal Server Error"
        });
    }
}
module.exports=submitCodeRateLimiter;