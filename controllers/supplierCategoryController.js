const SupplierCategory = require("../models/SupplierCategory")

module.exports = {

    createSupplierCategory: async (req, res) => {
        const newSupplierCategory =  new SupplierCategory(req.body);
        try {
            await newSupplierCategory.save();

            res.status(201).json({ status: true, message: 'Supplier Category successfully created' });
        } catch (error) {
            console.error("Error creating category:", error);
            throw error;
        }
    },

    updateSupplierCategory:  async (req, res) => {
        const id = req.params.id;
        const {title,value, imageUrl } = req.body;



        try {

            const updatedSupplierCategory = await SupplierCategory.findByIdAndUpdate(id, {
                title: title,
                value: value,
                imageUrl: imageUrl
            }, { new: true });  // This option ensures the updated document is returned

            if (!updatedSupplierCategory) {
                return res.status(404).json({ status: false, message: 'SupplierCategory not found.' });
            }

            res.status(200).json({ status: true, message: 'SupplierCategory successfully updated'});
        } catch (error) {
            console.error("Error updating category:", error);
            res.status(500).json({ status: false, message: 'An error occurred while updating the category.' });
        }
    },

    deleteSupplierCategory: async (req, res) => {
        const id  = req.params;

        if (!id) {
            return res.status(400).json({ status: false, message: 'SupplierCategory ID is required for deletion.' });
        }

        try {
            await SupplierCategory.findByIdAndRemove(id);

            res.status(200).json({ status: true, message: 'SupplierCategory successfully deleted' });
        } catch (error) {
            console.error("Error deleting category:", error);
            res.status(500).json({ status: false, message: 'An error occurred while deleting the category.' });
        }
    },

    getAllCategories: async (req, res) => {
        try {
            // Find categories where 'title' is not equal to "More"
            const categories = await SupplierCategory.find({ title: { $ne: "More" } }, { __v: 0 });

            res.status(200).json(categories);
        } catch (error) {
            console.error("Error fetching categories:", error);
            res.status(500).json({ status: false, message: 'An error occurred while fetching the categories.' });
        }
    },


    patchSupplierCategoryImage: async (req, res) => {
        const id  = req.params;
        const imageUrl  = req.body;

        try {
            const existingSupplierCategory = await SupplierCategory.findById({_id: id} );  // This option ensures the updated document is returned

            const updatedSupplierCategory = new SupplierCategory({
                title: existingSupplierCategory.title,
                value: existingSupplierCategory.value,
                imageUrl: imageUrl
            })

            await updatedSupplierCategory.save();

            res.status(200).json({ status: true, message: 'SupplierCategory image successfully patched', data: updatedSupplierCategory });
        } catch (error) {
            console.error("Error patching category image:", error);
            res.status(500).json({ status: false, message: 'An error occurred while patching the category image.' });
        }
    },

    getRandomCategories: async (req, res) => {
        try {
            let categories = await SupplierCategory.aggregate([
                { $match: { value: { $ne: "more" } } },  // Exclude the "more" category from random selection
                { $sample: { size: 4 } }  // Get 7 random categories
            ]);

            // Find the "More" category in the database
            const moreSupplierCategory = await SupplierCategory.findOne({ value: "more" });

            if (moreSupplierCategory) {
                categories.push(moreSupplierCategory);
            }

            res.status(200).json(categories);
        } catch (error) {
            console.error("Error fetching limited categories:", error);
            res.status(500).json({ status: false, message: 'An error occurred while fetching the categories.' });
        }
    }

}