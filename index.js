import express from "express";
import authRoutes from "./Routes/authRoutes.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import viewRoutes from "./Routes/viewRoutes.js";
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(cookieParser());

app.set('view engine', 'ejs');
mongoose
  .connect(process.env.mongoDB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });
app.get("/", (req, res)=>{
  res.render("home");
})
app.use("/auth", authRoutes);
app.use("/", viewRoutes);
app.listen(3000, () => {
  console.log("Listening on port 3000");
});
