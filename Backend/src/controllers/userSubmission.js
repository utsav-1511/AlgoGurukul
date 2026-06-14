const Problem = require("../models/problem");
const Submission = require("../models/submission");
const {getLanguageId,submitBatch,submitToken}  = require("../utils/problemUtility");

const submitCode = async (req,res)=>{
    try{
        const userId = req.result._id; 
        const problemId = req.params.id;

        const {language,code} = req.body;
        // console.log(language,code);
        if(!userId||!problemId||!code||!language){
            res.status(404).send("Field Missing");
        }
        const problem =await Problem.findById(problemId);
        //testCases(Hidden);
        const submitted = await Submission.create({
            userId:userId,
            problemId:problemId,
            languages:language,
            code:code,  
            status:"pending",
            testCasesTotal:problem.hiddenTestCases.length
        })
        // console.log(submitted,"hi");
        //send result to judge0
        const languageId = getLanguageId(language);
        // console.log(languageId)
        const submission = problem.hiddenTestCases.map((testcase)=>({
                source_code:code,
                language_id: languageId,
                stdin:testcase.input,
                expected_output:testcase.output
        }
        ));

        const submitResult = await submitBatch(submission);
        console.log(submitResult);

        const returnToken = await submitResult.map((value)=>value.token);
        // console.log(returnToken);

        const testResult = await submitToken(returnToken);
        // console.log(testResult);

        let runtime =0;
        let memory = 0;
        let testCasesPassed=0;
        let status = "accepted";
        let errorMessage = null;
        for(const test of testResult){
            if(test.status_id == 3){
                testCasesPassed++;
                runtime += parseFloat(test.time);
                memory = Math.max(memory,test.memory)
            }else{
                if(test.status_id==4){
                    status = "error";
                    errorMessage= test.stderr;
                }
                else{
                    status:"wrong";
                    errorMessage= test.stderr;
                }

            }
        }
        submitted.status=status;
        submitted.runtime= runtime;
        submitted.memory=memory;
        submitted.errorMessage=errorMessage;
        submitted.testCasesPassed=testCasesPassed;
        await submitted.save();

        if(!req.result.problemSolved.includes(problemId)){
            req.result.problemSolved.push(problemId);
            await req.result.save()
        }
        const accepted = (status="accepted");
        res.status(201).json(
            {
                accepted,
                testCasesTotal:problem.hiddenTestCases.length,
                testCasesPassed,
                runtime,
                memory
            }
        );

    }
    catch(err){
        res.status(500).send("Error "+err);
    }
}

const runCode = async(req,res)=>{

    try{
        const userId = req.result._id; 
        const problemId = req.params.id;

        const {language,code} = req.body;
        if(!userId||!problemId||!code||!language){
            res.status(404).send("Field Missing");
        }
        const problem =await Problem.findById(problemId);
        const languageId = getLanguageId(language);

        const submission = problem.visibleTestCases.map((testcase)=>({
                source_code:code,
                language_id: languageId,
                stdin:testcase.input,
                expected_output:testcase.output
        }
        ));
        const submitResult = await submitBatch(submission);

        const returnToken = await submitResult.map((value)=>value.token);

        const testResult = await submitToken(returnToken);
        // const accepted = (status="accepted");
        let runtime =0;
        let memory = 0;
        let testCasesPassed=0;
        let status = "accepted";
        let errorMessage = null;
        for(const test of testResult){
            if(test.status_id == 3){
                testCasesPassed++;
                runtime += parseFloat(test.time);
                memory = Math.max(memory,test.memory)
            }else{
                if(test.status_id==4){
                    status = "error";
                    errorMessage= test.stderr;
                }
                else{
                    status:"wrong";
                    errorMessage= test.stderr;
                }

            }
        }
        
        res.status(201).json(
            {
                success:status,
                testCases:testResult,
                runtime,
                memory
            }
        );
        res.status(201).send(testResult);
    }
    catch(err){
        res.status(500).send("Error "+err)
    }
    
}


module.exports = {submitCode,runCode};
