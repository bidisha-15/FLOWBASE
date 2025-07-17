import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Verification from '../models/verification.js';
import { sendEmail } from '../libs/send-nodemail.js';
import aj from '../libs/arcjet.js';


const registerUser = async(req,res)=>{
    try{
        const {name, email, password} = req.body;
        const decision = await aj.protect(req, {email});
        console.log("Arcjet decision:", decision.isDenied());
        if (decision.isDenied()) {
            return res.status(403).json({ message: "Request blocked by Arcjet" });
        }
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt=await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });

        const verificationToken = jwt.sign(
            { userId: newUser._id, purpose: 'email verification' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } 
        );

        await Verification.create({
            userId: newUser._id,
            token: verificationToken,
            expiresAt: new Date(Date.now() + 3600000) // 1 hour
        });

        //send email
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        const emailBody = `<p>Hi ${newUser.name},</p>
        <p>Thank you for registering. Please click the link below to verify your email address:</p>
        <p><a href="${verificationLink}">Verify Email</a></p>`
        const emailSubject = "Email Verification for Flowbase";

        const isEmailSent = await sendEmail(email, emailSubject, emailBody);
        if (!isEmailSent) {
            return res.status(500).json({ 
                message: "Failed to send verification email" 
            });
        }

        res.status(201).json({
            message: "Verification mail sent to your email address. Please check and verify your account.",
    })
}
    catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const loginUser=async(req,res)=>{
     try{
        const {name, email, password} = req.body;
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        if(!user.isEmailVerified) {
            const existingVerification = await Verification.findOne({ 
                userId: user._id });
            if(existingVerification && existingVerification.expiresAt > new Date()){
                return res.status(400).json({ 
                    message: "Email not verified. Please check your email for verification link." 
                });
            }
            else{
                await Verification.findByIdAndDelete(existingVerification._id);
                const verificationToken = jwt.sign(
                    { userId: user._id, purpose: 'email verification' },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' } 
                );
                await Verification.create({
                    userId: user._id,
                    token: verificationToken,
                    expiresAt: new Date(Date.now() + 3600000) // 1 hour
                });

                 const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        const emailBody = `<p>Hi ${user.name},</p>
        <p>Thank you for registering. Please click the link below to verify your email address:</p>
        <p><a href="${verificationLink}">Verify Email</a></p>`
        const emailSubject = "Email Verification for Flowbase";

        const isEmailSent = await sendEmail(email, emailSubject, emailBody);
        if (!isEmailSent) {
            return res.status(500).json({ 
                message: "Failed to send verification email" 

            });
        }
                return res.status(400).json({ 
                    message: "Please check your email for verification link." 
                });
            }
        }
        

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {    
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id, purpose: "login" },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        user.lastLogin = new Date();
        await user.save();

        const userData = user.toObject();
        delete userData.password; // Remove password from user data


        res.status(200).json({
            message: "Login successful",
            token,
            user : userData,
        });
    }
    catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (!payload ) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { userId, purpose } = payload;
        if (purpose !== 'email verification') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const verification = await Verification.findOne({ userId, token });
        if (!verification) {
            return res.status(401).json({ message: "Invalid or expired verification token" });
        }

        const isTokenExpired = verification.expiresAt < new Date();
        if (isTokenExpired) {
            return res.status(401).json({ message: "Verification token has expired" });
        }

        const user = await User.findById(userId);
        if (!user) {    
            return res.status(404).json({ message: "User not found" });
        }   

        if (user.isEmailVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }

        user.isEmailVerified = true;
        await user.save();
        await Verification.findByIdAndDelete( verification._id );

        res.status(200).json({ message: "Email verified successfully" });
    }
    catch (error) {
        console.error("Error verifying email:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }   
}

const resetPasswordRequest = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!user.isEmailVerified) {
            return res.status(400).json({ message: "Please verify your email" });
        }

        const existingVerification = await Verification.findOne({ userId: user._id });
        if (existingVerification && existingVerification.expiresAt > new Date()) {
            return res.status(400).json({ message: "Password reset request already exists. Please check your email." });
        }

        if( existingVerification && existingVerification.expiresAt < new Date()) {
            await Verification.findByIdAndDelete(existingVerification._id);
        }

        const resetPasswordToken = jwt.sign(
            { userId: user._id, purpose: "reset-password" },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        await Verification.create({
            userId: user._id,
            token: resetPasswordToken,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        });

        const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;
        const emailBody = `<p>Click <a href="${resetPasswordLink}">here</a> to reset your password</p>`;
        const emailSubject = "Password Reset Request for Flowbase";

        const isEmailSent = await sendEmail(email, emailSubject, emailBody);
        if (!isEmailSent) {
            return res.status(500).json({ 
                message: "Failed to send password reset email" 
            });
        }
        res.status(200).json({
            message: "Password reset email sent. Please check your email.",
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" }); 
    }
}


const verifyResetPasswordTokenAndResetPassword = async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (!payload) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { userId, purpose } = payload;
        if (purpose !== 'reset-password') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const verification = await Verification.findOne({ userId, token });
        if (!verification) {
            return res.status(401).json({ message: "Invalid or expired reset password token" });
        }

        const isTokenExpired = verification.expiresAt < new Date();
        if (isTokenExpired) {
            return res.status(401).json({ message: "Reset password token has expired" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if(newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        
        await Verification.findByIdAndDelete(verification._id);

        res.status(200).json({ message: "Password reset successfully" });
    }
    catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


export {registerUser,loginUser, verifyEmail, resetPasswordRequest, verifyResetPasswordTokenAndResetPassword}
