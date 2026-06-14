const mongoose = require("mongoose");
const {Schema} = mongoose;


const userSchema = new Schema({
    firstName:{
        type:String,
        minLength:3,
        maxLength:20,
        required:true
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:17,
        required:true
    },
    emailId:{
        type:String,
        unique:true,
        toLowerCase:true,
        trim:true,
        required:true
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    age:{
        type:Number,
        min:10,
        max:100,
        required:true
    },
    problemSolved:{
        type:[
            {
                type:Schema.Types.ObjectId,
                ref:'problem',
            }
        ]
    },
    password:{
        type:String,
        required:true
    }
    
},
    {
        timestamps:true
    }
);

const User = mongoose.model("user",userSchema);
module.exports= User;