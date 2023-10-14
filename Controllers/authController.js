import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import crypto from "node:crypto";
dotenv.config();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN
  }
});
async function mailHandler(mailObject){

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: mailObject.recipient,
  subject: mailObject.subject,
  html: mailObject.body,
};
 await transporter.sendMail(mailOptions);
}
const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

export const registerUser = async (req, res) => {
  try {
    const { email, userName, password } = req.body;
    const user = new User({
      email: email,
      userName: userName,
      password: bcrypt.hashSync(password, 10),
    });
    const emailVerificationToken = user.generateVerificationLink();
    await user.save();
    const jwtoken = createjwtoken({email:user.email, userName: user.userName});
    const mailOptions={
      recipient:user.email,
      subject:'Verify Email',
      body: `You have signed up successfully.<br>To verify your email click the link below: <br>

      <a href="http://localhost:3000/auth/verify-email?token=${emailVerificationToken}">Verify Email </a>
      `
    };
   await mailHandler(mailOptions);
    res.cookie('jwt', {jwtoken, user}, cookieOptions);
    res.send({status:"success", jwtoken ,data: {
        user
    }});
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

function createjwtoken(payload){
    return jwt.sign(payload, process.env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
}

export const verifyEmail= async(req,res)=>{
  try{
    const token = req.query.token;
    const tokenHash =  crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({emailVerificationLink:tokenHash});
    user.emailVerificationToken=undefined;
    user.isVerifiedAccount = true;
    await user.save();

    res.render("accountVerified");
  }catch(err){
    console.log(err);
    res.status(500).send(err);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    const isCorrectPassword = await user.comparePassword(password);
    if (!isCorrectPassword) {
      res.status(401).send("incorrect pass");
      return;
    }
 
    const jwtoken = createjwtoken({ email: user.email, userName: user.userName});
   
    res.cookie("jwt", {jwtoken, user}, cookieOptions);
    res.send({
      status: "success",
      jwtoken,
      data: {
        user
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
    return;
  }
};

export const logout = async (req, res) =>{
  try{
  res.clearCookie("jwt");
  res.send({status:"success"});

}catch(err){
  res.status(500).send(err);
}

};