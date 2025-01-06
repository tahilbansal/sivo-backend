const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    itemTags: {type: Array, required: false},
    category: {type: String, required: false},
    code: {type: String, required: false},
    unit: {type: String, required: true},
    isAvailable: {type: Boolean , required: true, default: true},
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    description: { type: String, required: false },
    price: { type: Number, required: false },
    imageUrl: { type: Array, required: false },
});

module.exports = mongoose.model('Item', itemSchema);


