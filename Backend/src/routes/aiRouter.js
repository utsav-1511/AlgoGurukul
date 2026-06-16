const express =require("express");
const userMiddleware = require("../middleware/userMiddleware");
const aiRouter = express.Router();
const aiChat = require("../controllers/aiChatBot");


aiRouter.post("/chat",userMiddleware,aiChat);

module.exports= aiRouter;