const express = require("express");
const app = express();
require("dotenv").config();
const main = require("./config/db");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/userAuth");
const redisClient = require("./config/redis");
const problemCreator = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");
const cors = require("cors");
const aiRouter = require("./routes/aiRouter");
const  videoRouter =require("./routes/videoRouter");
const axios = require("axios");
axios.defaults.withCredentials = true;

//new line
app.set("trust proxy", 1);
app.use(cors({
  origin: ["https://algogurukul.netlify.app","https://algo-gurukul.vercel.app","http://localhost:5173"],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.get("/test", (req, res) => {
  res.json({ success: true });
});
app.use("/user", authRouter);
app.use("/problem", problemCreator);
app.use("/submission",submitRouter);
app.use("/ai",aiRouter);
app.use("/video",videoRouter);
app.use("/",(req,res)=>{
  res.json({
    message:"server running"
  })
})

const initializeConnection = async () => {
  try {
    await main();
    await redisClient.connect();
    console.log("Redis Client Connected Successfully");

    app.listen(process.env.PORT, () => {
      console.log("Server Started at Port " + process.env.PORT);
    });
  } catch (err) {
    console.log("Error " + err);
  }
};``

initializeConnection();
