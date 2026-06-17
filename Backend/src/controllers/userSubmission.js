const Problem = require("../models/problem");
const Submission = require("../models/submission");
const {getLanguageId,submitBatch,submitToken}  = require("../utils/problemUtility");

const submitCode = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;
        const { language, code } = req.body;

        // Validation
        if (!userId || !problemId || !code || !language) {
            return res.status(400).send("Field Missing");
        }

        const problem = await Problem.findById(problemId);

        if (!problem) {
            return res.status(404).send("Problem Not Found");
        }

        const submitted = await Submission.create({
            userId,
            problemId,
            languages: language,
            code,
            status: "pending",
            testCasesTotal: problem.hiddenTestCases.length
        });

        const languageId = getLanguageId(language);

        const submission = problem.hiddenTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));

        const submitResult = await submitBatch(submission);

        const returnToken = submitResult.map((value) => value.token);

        const testResult = await submitToken(returnToken);

        let runtime = 0;
        let memory = 0;
        let testCasesPassed = 0;
        let status = "accepted";
        let errorMessage = null;

        for (const test of testResult) {
            if (test.status_id === 3) {
                testCasesPassed++;
                runtime += parseFloat(test.time || 0);
                memory = Math.max(memory, test.memory || 0);
            } else {
                if (test.status_id === 4) {
                    status = "wrong";
                    errorMessage =
                        test.stderr ||
                        test.compile_output ||
                        test.message ||
                        "Wrong Answer";
                } else {
                    status = "error";
                    errorMessage = test.stderr;
                }
                // No need to check remaining test cases once failed
                break;
            }
        }

        submitted.status = status;
        submitted.runtime = runtime;
        submitted.memory = memory;
        submitted.errorMessage = errorMessage;
        submitted.testCasesPassed = testCasesPassed;

        await submitted.save();
        console.log(submitted);
        // Add solved problem only if accepted
        if (
            status === "accepted" &&
            !req.result.problemSolved.includes(problemId)
        ) {
            req.result.problemSolved.push(problemId);
            await req.result.save();
        }

        const accepted = status === "accepted";

        return res.status(201).json({
            accepted,
            status,
            testCasesTotal: problem.hiddenTestCases.length,
            testCasesPassed,
            runtime,
            memory,
            errorMessage
        });
    } catch (err) {
        console.error(err);

        if (res.headersSent) {
            return;
        }

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const runCode = async(req,res)=>{

    try{
        const userId = req.result._id; 
        const problemId = req.params.id;

        const {language,code} = req.body;
        if(!userId||!problemId||!code||!language){
            return res.status(404).send("Field Missing");
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
        let runtime = 0;
        let memory = 0;
        let testCasesPassed = 0;
        let status = "accepted";
        let errorMessage = null;

        for (const test of testResult) {
            if (test.status_id === 3) {
                testCasesPassed++;
                runtime += parseFloat(test.time || 0);
                memory = Math.max(memory, test.memory || 0);
            } else {
                if (test.status_id === 4) {
                    status = "wrong";
                    errorMessage =
                        test.stderr ||
                        test.compile_output ||
                        test.message ||
                        "Wrong Answer";
                } else {
                    status = "error";
                    errorMessage = test.stderr;
                }
            }
        }

        const accepted = status === "accepted";

        return res.status(201).json({
            accepted,
            status,
            testCasesPassed,
            totalTestCases: problem.visibleTestCases.length,
            testCases: testResult,
            runtime,
            memory,
            errorMessage
        });
    }
    catch(err){
        if(res.headersSent){
            return;
        }

        return res.status(500).send("Error " + err.message);
    }
    
}


module.exports = {submitCode,runCode};
