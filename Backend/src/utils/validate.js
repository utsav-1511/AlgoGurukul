const validator = require("validator");

const validate =(data)=>{
    const mandatoryFields = ["firstName" , "emailId" ,"password" ];
    const IsAllowed = mandatoryFields.every((k)=>Object.keys(data).includes(k));
    if(!IsAllowed){
        throw new Error("Some Fields are missing");
    }
    if(!validator.isEmail(data.emailId)){
        throw new Error("Invalid Credentials")
    }
    if(!validator.isStrongPassword(data.password)){
        throw new Error("Invalid Credentials");
    }
    
}
module.exports= validate;
