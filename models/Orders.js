const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    unitPrice:{type:Number, default: 0},
    instructions: {type: String, default: ''},
});

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [orderItemSchema],
    orderTotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    deliveryAddress: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Address", 
        required: true 
    },
    deliveryDate : {type: Date, required: false},
    supplierAddress: {type: String, required: true},
    paymentMethod: { type: String },
    paymentStatus: { type: String, default: "Pending", enum: ["Pending", "Completed", "Failed"] },
    orderStatus: { type: String, default: "Placed", enum: ["Placed", "Preparing", "Manual" ,"Out_for_Delivery", "Ready","Cancelled", "Delivered"] },
    orderDate: { type: Date, default: Date.now },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier"},
    supplierCoords: [Number],
    recipientCoords: [Number],
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
    rating: { type: Number, min: 1, max: 5 },
    feedback: String,
    promoCode: String,
    discountAmount: Number,
    notes: String
}, {timestamps: true});

module.exports = mongoose.model('Order', orderSchema);