const Rating = require('../models/Rating')
const Supplier = require('../models/Supplier');
const item = require('../models/Item');
const Driver = require('../models/Driver');
module.exports = {
    addRating: async (req, res) => {
        const newRating = new Rating({
            userId: req.user.id,
            ratingType: req.body.ratingType,
            product: req.body.product,
            rating: req.body.rating
        });
    
        try {
             await newRating.save();
    
            if (req.body.ratingType === 'Supplier') {
                const suppliers = await Rating.aggregate([
                    { $match: { ratingType: 'Supplier', product: req.body.product } },
                    { $group: { _id: '$product', averageRating: { $avg: '$rating' } } }
                ]);
    
                if (suppliers.length > 0) {
                    const averageRating = suppliers[0].averageRating;
                    await Supplier.findByIdAndUpdate(req.body.product, { rating: averageRating }, { new: true });
                }
            } else if (req.body.ratingType === 'Driver') {
                const driver = await Rating.aggregate([
                    { $match: { ratingType: 'Driver', product: req.body.product } },
                    { $group: { _id: '$product', averageRating: { $avg: '$rating' } } }
                ]);
    
                if (driver.length > 0) {
                    const averageRating = driver[0].averageRating;
                    await Driver.findByIdAndUpdate(req.body.product, { rating: averageRating }, { new: true });
                }
            } else if (req.body.ratingType === 'item') {
                const item = await Rating.aggregate([
                    { $match: { ratingType: 'item', product: req.body.product } },
                    { $group: { _id: '$product', averageRating: { $avg: '$rating' } } }
                ]);
    
                if (item.length > 0) {
                    const averageRating = item[0].averageRating;
                    await item.findByIdAndUpdate(req.body.product, { rating: averageRating }, { new: true });
                }
            }
    
            res.status(200).json({status: true, message: 'Rating added successfully'});
        } catch (error) {
            res.status(500).json({status: false, message: error.message});
        }
    },


     checkIfUserRatedSupplier: async (req, res) => {
        const ratingType = req.query.ratingType;
        const product = req.query.product;

        try {
            const ratingExists = await Rating.findOne({
                userId: req.user.id,
                product: product,
                ratingType: ratingType
            });
    
            if (ratingExists) {
                return res.status(200).json({ status: true, message: "You have already rated this supplier." });
            } else {
                return res.status(200).json({ status: false, message: "User has not rated this supplier yet." });
            }
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }
}