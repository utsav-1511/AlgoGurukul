const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const problemRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware")
const {createProblem,updateProblemById,deleteProblemById,getProblemById,getAllProblem, solvedAllProblemByUser,submissionMade} = require("../controllers/userProblems");

problemRouter.post("/createProblem",adminMiddleware,createProblem);
problemRouter.put("/update/:id",adminMiddleware,updateProblemById);
problemRouter.delete("/delete/:id",adminMiddleware,deleteProblemById);


problemRouter.get("/problemById/:id",userMiddleware,getProblemById);
problemRouter.get("/getAllProblem/",userMiddleware,getAllProblem);
problemRouter.get("/problemSolvedByUser",userMiddleware ,solvedAllProblemByUser);
problemRouter.get("/submissions/:pid",userMiddleware,submissionMade);
module.exports= problemRouter;