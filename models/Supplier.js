const mongoose = require('mongoose');
const generateOtp = require('../utils/otp_generator')
const supplierSchema = new mongoose.Schema({
    title: {type: String , required: true},
    time: {type: String , required: true},
    imageUrl: {type: String , required: true},
    items: {type: Array , default: []},
    category: {type: String,  required: false},
    pickup: {type: Boolean , default: true},
    delivery: {type: Boolean, default: true},
    owner: {type: String , required: true},
    isAvailable: {type: Boolean , default: false},
    showItemPrice: {type: Boolean , default: false},
    code: {type: String , required: true},
    logoUrl: {type: String , required: true},
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    ratingCount: {type: String, default: "210"},
    verification: {type: String ,default: "Pending", enum: ["Pending", "Verified", "Rejected"]},
    verificationMessage: {type: String, default: "Please allow up to 24 hours for your verification to be processed. You will receive a notification once your verification is complete."},
    coords: {
        id: {type: String, default: generateOtp() },
        latitude: {type: Number , required: true},
        longitude: {type: Number , required: true},
        latitudeDelta:{type: Number , default: 0.0122},
        longitudeDelta: {type: Number , default: 0.0221},
        address: {type: String , required: true},
        title: {type: String , required: true},
    },
    earnings: {type: Number, default: 0.0}
});

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
