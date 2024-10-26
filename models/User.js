const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: false },
        email: { type: String, required: true , unique : false},
        fcm: { type: String, required: false, default: "none" },
        otp: { type: String, required: false, default: "none" },
        verification: {type: Boolean, default: false},
        password: { type: String, required: true },
        phone: { type: String, required: false, default:"01234567890"},
        phoneVerification: { type: Boolean, default: false},
        address: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address", 
            required: false
        },
        userType: { type: String, required: false, enum: ['Admin', 'Driver', 'Vendor', 'Client'] },
        profile: {
            type: String,
            require: false,
            default: "https://firebasestorage.googleapis.com/v0/b/rivus-flutter.appspot.com/o/icons%2Fprofile-photo.png?alt=media&token=3afe87ea-0e62-4143-a798-cbb713203045"
        },

    }, { timestamps: false }
);
module.exports = mongoose.model("User", UserSchema)