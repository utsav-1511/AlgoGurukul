const {getLanguageId,submitBatch, submitToken} = require("../utils/problemUtility");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");

const createProblem=async (req, res)=>{
    const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,
        startCode,referenceSolution}= req.body;
    try{
        if(!Array.isArray(referenceSolution) || !Array.isArray(visibleTestCases)){
            return res.status(400).send("referenceSolution and visibleTestCases must be arrays");
        }

        for(const {language,completeCode} of referenceSolution){
            const languageId= getLanguageId(language);
            const submission = visibleTestCases.map((testcase)=>({
                    source_code:completeCode,
                    language_id: languageId,
                    stdin:testcase.input,
                    expected_output:testcase.output
                }
            ));
            const submitResult = await submitBatch(submission);
            // console.log(submitResult);

            const returnToken = await submitResult.map((value)=>value.token);
            // console.log(returnToken);

            const testResult = await submitToken(returnToken);
            console.log(testResult);
            
            for(const test of testResult){
                if(test.status_id!=3){
                    console.log(test);
                    return res.status(400).send("Error Ocurred")
                }
            }
        }
        //store in db
        const userProblem = await Problem.create({
            ...req.body,
            problemCreator : req.result._id
        })
        res.status(201).send("Problem Created Sucessfully");
    }
    catch(err){
        console.log(err);
        res.status(400).send("Error "+err.message);
    }
}

const updateProblemById = async(req,res)=>{
    const {id}= req.params;
    
    const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,
        startCode,referenceSolution}= req.body;
    try{
        if(!id){
            return res.status(400).send("ID missing");
        }
        const problemDetails = Problem.findById(id);
        if(!problemDetails){
            return res.status(404).send("Id is Missing in DB");
        }
        if(!Array.isArray(referenceSolution) || !Array.isArray(visibleTestCases)){
            return res.status(400).send("referenceSolution and visibleTestCases must be arrays");
        }

        for(const {language,completeCode} of referenceSolution){
            const languageId= getLanguageId(language);
            const submission = visibleTestCases.map((testcase)=>({
                    source_code:completeCode,
                    language_id: languageId,
                    stdin:testcase.input,
                    expected_output:testcase.output
                }
            ));
            const submitResult = await submitBatch(submission);
            // console.log(submitResult);

            const returnToken = await submitResult.map((value)=>value.token);
            // console.log(returnToken);

            const testResult = await submitToken(returnToken);
            // console.log(testResult);
            
            for(const test of testResult){
                if(test.status_id!=3){
                    console.log(test);
                    return res.status(400).send("Error Ocurred")
                }
            }
        }
        //store in db
        const userProblem = await Problem.findByIdAndUpdate(id,{
            ...req.body,
            problemCreator : req.result._id
        },{runValidators:true});

        res.status(200).send("Problem Updated Sucessfully");
    }
    catch(err){
        res.status(500).send("Error "+err);
    }
}

const deleteProblemById = async(req,res)=>{
    const {id}= req.params;
    try{
        if(!id){
            return res.status(400).send("ID missing");
        }
        const deleted =await Problem.findByIdAndDelete(id);
        if(!deleted){
            return res.status(404).send("Invalid Id");
        }
        res.status(200).send("Deleted Sucessfully");
    }
    catch(err){
        res.status(500).send("Error "+err);
    }
}

const getProblemById = async(req,res)=>{
    const {id} = req.params;
    try{
        if(!id){
            return  res.status(400).send("Id is missing");
        }
        const getProblem =await Problem.findById(id,"title description difficulty tags visibleTestCases startCode referenceSolution");
        if(!getProblem){
            return res.status(404).send("Not Found in DB");
        }
        res.send(getProblem);
    }
    catch(err){
        res.status(500).send("Error "+err);
    }
}

//update this to pages when more questions
const getAllProblem = async(req,res)=>{
    try{

        const allProblem = await Problem.find({},"title tags difficulty");
        if(!allProblem){
            return res.status(404).send("Empty");
        }
        res.status(200).send(allProblem);
    }
    catch(err){
        res.send(500).send("Error "+err);
    }

}

const solvedAllProblemByUser = async(req,res)=>{  
    try{
        const id = req.result._id;
        const data = await User.findById(id).populate({
            path:"problemSolved",
            select:"_id title tags difficulty"
        });
        res.send(data.problemSolved);
    }
    catch(err){
        res.status(500).send("Error "+err)
    }
}

const submissionMade = async(req,res)=>{
    try{
        const userId=req.result._id;
        const problemId = req.params.pid;
        const problemSubmissiions= await Submission.find({userId,problemId});
        console.log(problemSubmissiions);
        res.status(200).send(problemSubmissiions);
    }
    catch(err){
        res.status(500).send("Error "+err);
    }
}

module.exports = {createProblem,updateProblemById, deleteProblemById,getProblemById, getAllProblem, solvedAllProblemByUser, submissionMade};
