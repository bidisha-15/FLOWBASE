import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim:true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        select: false, 
    },
    profilePicture: {
        type: String,
        default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y', //
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    is2FAEnabled: {
        type: Boolean,
        default: false,
    },
    twoFAOtp:{
        type: String,
        select: false, // Do not return OTP in queries
    },
    twoFAOtpExpiresAt: {
        type: Date,
        select: false, // Do not return OTP expiration in queries
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;