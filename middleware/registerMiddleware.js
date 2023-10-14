import express from "express";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
export const checkUniqueEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      res.status(400).send("User already exists");
      return;
    }
    next();
  } catch (err) {
    res.status(500).send(err);
  }
};

export const checkEmailExists = async(req, res, next) =>{
  const {email} = req.body;
  const isExistingEmail = await User.findOne({email:email});
  if(isExistingEmail){
    next();
  }
  else{
  res.status(400).send("Email not registered");
  return;
}
};

export const checkUserLoggedIn =  function(req, res, next){
  if(!req.cookies.jwt){
    return res.status(401).send("Unauthorized");
  }
  const {jwtoken, user} = req.cookies.jwt;
 
       if(jwt.verify(jwtoken, process.env.JWT_SECRET)){
       req.user = user;
          next();
       }
       else{
       
          return res.status(401).send("Unauthorized");
       
       }
  

};
