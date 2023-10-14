import express from "express";
import * as verifyUserMiddleware from "../middleware/registerMiddleware.js";
const router = express.Router();
router.get("/login", (req, res)=>{
    res.render("login");
});
router.get("/register", (req, res)=>{
    res.render("register");
});
router.get("/myAccount", verifyUserMiddleware.checkUserLoggedIn , (req, res)=>{
    const user = req.user;
   res.render("accountInformation", {user:user});
});

router.get("/account-verified", (req, res)=>{
    res.render("accountVerified");
});

export default router;