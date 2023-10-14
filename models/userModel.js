import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
const userSchema = new mongoose.Schema({
  userName: String,
  password: String,
  email: String,
  isVerifiedAccount: {
    type: Boolean,
    default: false,
  },
  emailVerificationLink:String,
});
userSchema.methods.comparePassword = async function(userPassword){
  const isMatch = await bcrypt.compare(userPassword, this.password);
  if(isMatch){
    return true;
  }
  return false;
};

userSchema.methods.generateVerificationLink = function(){
  const token =  crypto.randomBytes(32).toString('hex');
  this.emailVerificationLink = crypto.createHash('sha256').update(token).digest('hex');
  return token;
};


const User = new mongoose.model("Visitor", userSchema);
export default User;
