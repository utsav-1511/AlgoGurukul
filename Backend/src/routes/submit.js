const express=require("express");
const userMiddleware = require("../middleware/userMiddleware");
const submitRouter = express.Router();
const {submitCode,runCode} = require("../controllers/userSubmission");
const submitCodeRateLimiter = require("../middleware/submitCodeRateLimiter");



submitRouter.post("/submit/:id",userMiddleware,submitCodeRateLimiter,submitCode);
submitRouter.post("/runCode/:id",userMiddleware,submitCodeRateLimiter,runCode);

module.exports= submitRouter;