const mongoose = require('mongoose');

const supplierCategorySchema = new mongoose.Schema({
    title: {type: String , required: true},
    value: {type: String , required: true},
    imageUrl: {type: String , required: true},
});

module.exports = mongoose.model('SupplierCategory', supplierCategorySchema);