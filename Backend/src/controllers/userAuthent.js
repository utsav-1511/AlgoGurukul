const validate = require("../utils/validate");
const User = require("../models/user");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const Submission = require("../models/submission");
const register =async (req,res)=>{
    try{
        validate(req.body);
        const {emailId, password}= req.body;
        console.log(req.body);
        req.body.role= "user"
        req.body.password = await bcrypt.hash(password,10);
        const user = await User.create(req.body);
        console.log(user);
        const token = jwt.sign({_id:user._id,emailId:user.emailId,role:"user"},process.env.JWT_KEY,{expiresIn:60*60});
        //changes made
        res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60
    });
        
        const reply = {
            firstName:user.firstName,
            emailId:user.emailId,
            role:user.role,
            _id:user._id,

        }
        res.status(201).json({
            user : reply,
            message:"Register Sucessfully"
        });
    }
    catch(err){
        res.status(400).send("Error "+err);
    }
}

const login = async(req,res)=>{
    try{
        const {emailId,password}= req.body;
        //nonEmpty
        if(!emailId || !password){
            throw new Error("Invalid Credentials")
        }
        //Finding User 
        const userDetails =await User.findOne({emailId});
        if(!userDetails){
            throw new Error("Invalid Credentials");
        }
        const isCorrectPassword = await bcrypt.compare(password,userDetails.password);
        if(!isCorrectPassword){
            throw new Error("Invalid Credentials");
        }
        const reply = {
            firstName:userDetails.firstName,
            emailId:userDetails.emailId,
            _id:userDetails._id,
            role:userDetails.role
        }
        // Issuing Token
        const token = jwt.sign({_id:userDetails._id,emailId,role:userDetails.role},process.env.JWT_KEY,{expiresIn:60*60});
        // res.cookie("token" ,token,{maxAge: 1000*60*60});
            res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 1000 * 60 * 60
        });
        res.status(200).json({
            user : reply,
            message:"Login Sucessfully"
        });
    }
    catch(err){
        res.status(401).send("Error ",err);
    }
}

const logout = async(req,res)=>{
    try{
        //validate the token
        const {token} = req.cookies;
        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`,'Blocked');
        await redisClient.expireAt(`token:${token}`,payload.exp);

        res.clearCookie("token");
        res.send("Logged Out Sucessfully")
    }
    catch(err){
        res.status(503).send("Error ",err)
    }
}

const adminRegister = async(req,res)=>{
    try{
        // if(req.result.role!=admin){
        //     throw new Error("Invalid Credentials")
        // }
        validate(req.body);
        const {emailId, password}= req.body;
        console.log(req.body);
        req.body.role= "admin"
        req.body.password = await bcrypt.hash(password,10);
        const user = await User.create(req.body);
        const token = jwt.sign({_id:user._id,emailId:user.emailId,role:user.role},process.env.JWT_KEY,{expiresIn:60*60});
        res.cookie("token" ,token,{maxAge: 1000*60*60});

        res.status(201).send("User created Sucessfully");
    }
    catch(err){
        res.status(400).send("Error "+err);
    }
}
const deleteProfile = async(req,res)=>{
    try{
        const id = req.result._id;
        await User.findByIdAndDelete(id);
        await Submission.deleteMany({userId:id});
        res.status(200).send("deleted user")
    }
    catch(err){
        res.status(500).send("Error "+err)
    }
}

module.exports= {register,login,logout,adminRegister,deleteProfile}
