const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    itemTags: {type: Array, required: true},
    category: {type: String, required: true},
    code: {type: String, required: true},
    isAvailable: {type: Boolean , required: true, default: true},
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: Array, required: true },
});

module.exports = mongoose.model('Item', itemSchema);


