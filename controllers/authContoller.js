const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const admin = require('firebase-admin')
const generateOtp = require('../utils/otp_generator');
const sendVerificationEmail = require('../utils/email_verification');
const sendNotification = require('../utils/sendNotification');

module.exports = {
    createUser: async (req, res) => {

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!emailRegex.test(req.body.email)) {
            return res.status(400).json({ status: false, message: "Invalid email format" });
        }

        // Validate password length
        const minPasswordLength = 8; // You can adjust the minimum length
        if (req.body.password.length < minPasswordLength) {
            return res.status(400).json({ status: false, message: "Password should be at least " + minPasswordLength + " characters long" });
        }

        try {
            // Check if email already exists
            const emailExist = await User.findOne({ email: req.body.email });
            if (emailExist) {
                return res.status(400).json({ status: false, message: "Email already exists" });
            }

            const otp = generateOtp();

            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                userType: 'Client',
                fcm: req.body.fcm,
                otp: otp.toString(),
                password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET).toString(),
            });

            await newUser.save();
            sendVerificationEmail(req.body.email, otp);
            // sendNotification(req.body.fcm, "itemly Registration", `The verification code has been sent to ${req.body.email}`, { type: "account_verification" })
            res.status(201).json({ status: true, message: 'User created successfully' })
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    loginUser: async (req, res) => {

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!emailRegex.test(req.body.email)) {
            return res.status(400).json({ status: false, message: "Invalid email format" });
        }

        // Validate password length
        const minPasswordLength = 8; // You can adjust the minimum length
        if (req.body.password.length < minPasswordLength) {
            return res.status(400).json({ status: false, message: "Password should be at least " + minPasswordLength + " characters long" });
        }

        try {
            const user = await User.findOne({ email: req.body.email }, { __v: 0, createdAt: 0, updatedAt: 0 });
            if (!user) {
                return res.status(401).json({ status: false, message: "User not found, check your email address" })
            }

            const decrytedpass = CryptoJS.AES.decrypt(user.password, process.env.SECRET);
            const depassword = decrytedpass.toString(CryptoJS.enc.Utf8);
            if (depassword !== req.body.password) {
                return res.status(401).json({ status: false, message: "Wrong password" })
            }
            const userToken = jwt.sign({
                id: user._id, userType: user.userType, email: user.email, fcm: user.fcm,
            }, process.env.JWT_SEC,
                { expiresIn: "21d" });


            const { password,otp, ...others } = user._doc;

            res.status(200).json({ ...others, userToken });

        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    },

    verifyUser: async (req, res) => {
        const phoneNumber = req.body.phone_number;
        const otp = req.body.otp;  // OTP coming from the request body
        const fcmToken = req.body.fcmToken;  // FCM token sent from the frontend

        try {
            // Check if the user exists
            let user = await User.findOne({ phone: phoneNumber });

            if (user) {
                user.otp = otp;
                user.fcm = fcmToken;
                await user.save();
                return res.status(200).json({message: 'User logged in', user});
            }
            else {
                // User does not exist, create a new user
                const newUser = new User({
                    phone : phoneNumber,
                    verification : true,
                    phoneVerification : true,
                    otp : otp,
                    fcm : fcmToken,
                });// Update FCM token

                await newUser.save();

                return res.status(201).json({message: 'User created and logged in', user: newUser});
            }

            // Verify the OTP (assuming you store OTP temporarily)
            // if (user.otp !== otp) {
            //     return res.status(400).json({ message: 'Invalid OTP' });
            // }

        } catch (error) {
            return res.status(500).json({ message: 'Error verifying user', error });
        }
    },

    // SEND OTP TO USER WHEN THEY ENTER PHONE NUMBER
    sendOtp: async (req, res) => {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ status: false, message: "Phone number is required" });
        }

        try {
            // Check if the phone number already exists
            let user = await User.findOne({ phoneNumber });

            // Send OTP using Firebase Authentication (for both existing and new users)
            await admin.auth().getUserByPhoneNumber(phoneNumber);

            // If user exists, let them know they can log in
            if (user) {
                return res.status(200).json({ status: true, message: "User exists. OTP sent for login." });
            }

            // Send OTP using Firebase Authentication (no verification yet)
            const sessionInfo = await admin.auth().createUser({ phoneNumber });
            //await admin.auth().createUser({ phoneNumber });

            res.status(200).json({ status: true, sessionInfo, message: "OTP sent successfully" });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    // VERIFY TOKEN, REGISTER, AND LOG IN USER
    verifyUserTokenAndRegister: async (req, res) => {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ status: false, message: "ID token is required" });
        }

        try {
            // Verify the token using Firebase Admin SDK
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const phoneNumber = decodedToken.phone_number;

            // Check if user already exists in DB
            let user = await User.findOne({ phoneNumber });

            if (!user) {
                // Register a new user if they don't exist
                user = new User({
                    phoneNumber,
                    userType: "Client",
                });
                await user.save();
                return res.status(201).json({ status: true, message: "User registered successfully" });
            }

            // If the user already exists, log them in directly
            const token = jwt.sign({
                id: user._id,
                phoneNumber: user.phoneNumber,
                userType: user.userType,
            }, process.env.JWT_SEC, { expiresIn: "21d" });

            res.status(200).json({ status: true, message: "User logged in successfully", token });
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    },

    // VERIFY OTP, REGISTER, AND LOG IN USER
    // verifyOtpAndRegister: async (req, res) => {
    //     const { phoneNumber, otp, sessionInfo } = req.body;
    //
    //     if (!phoneNumber || !otp || !sessionInfo) {
    //         return res.status(400).json({ status: false, message: "Phone number, OTP, and sessionInfo are required" });
    //     }
    //
    //     try {
    //         // Verify the OTP using Firebase Admin SDK
    //         const decodedOtp = await admin.auth().verifyIdToken(sessionInfo, otp);
    //
    //         // Check if user already exists in DB
    //         let user = await User.findOne({ phoneNumber });
    //
    //         if (!user) {
    //             // Register a new user if they don't exist
    //             user = new User({
    //                 phoneNumber,
    //                 userType: "Client",
    //             });
    //             await user.save();
    //             return res.status(201).json({ status: true, message: "User registered successfully" });
    //         }
    //
    //         // If the user already exists, skip registration and log them in directly
    //         const token = jwt.sign({
    //             id: user._id,
    //             phoneNumber: user.phoneNumber,
    //             userType: user.userType,
    //         }, process.env.JWT_SEC, { expiresIn: "21d" });
    //
    //         res.status(200).json({ status: true, message: "User logged in successfully", token });
    //     } catch (error) {
    //         res.status(500).json({ status: false, message: error.message });
    //     }
    // },
}
