const Item = require("../models/Item")
const Supplier = require("../models/Supplier");


module.exports = {
    addItem: async (req, res) => {
        const { title, itemTags, category, code, isAvailable, supplier, description, price, imageUrl } = req.body;

        // Simple validation
        if (!title || !itemTags || !category || !code || !description || !price || !imageUrl || !supplier || !isAvailable) {
            return res.status(400).json({ status: false, message: 'Missing required fields' });
        }
        const newItem = new Item({
            title: req.body.title,
            itemTags: req.body.itemTags,
            category: req.body.category,
            itemType: req.body.itemType,
            code: req.body.code,
            isAvailable: req.body.isAvailable,
            supplier: req.body.supplier,
            description: req.body.description,
            price: req.body.price,
            imageUrl: req.body.imageUrl
        });
    
        try {
            await newItem.save();
            res.status(201).json({ status: true, message: 'Item item successfully created', data: newItem });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    getItemById: async (req, res) => {
        const itemId = req.params.id;

        try {
            const item = await Item.findById(itemId)
                .populate({
                    path: 'Item',
                    select: 'coords'
                })

            if (!item) {
                return res.status(404).json({ status: false, message: 'Item item not found' });
            }

            res.status(200).json(item);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    getItemList: async (req, res) => {
        const supplier = req.params.id;
      
        try {
          const items = await Item.find({ supplier: supplier }).sort({ createdAt: -1 }); // Sort by date in descending order (newest first)
      
          res.status(200).json(items);
        } catch (error) {
          res.status(500).json({ status: false, message: error.message });
        }
      },


    deleteItemById: async (req, res) => {
        const itemId = req.params.id;

        try {
            const item = await Item.findByIdAndDelete(itemId);

            if (!item) {
                return res.status(404).json({ status: false, message: 'Item item not found' });
            }

            res.status(200).json({ status: true, message: 'Item item successfully deleted' });
        } catch (error) {
            res.status(500).json(error);
        }
    },

    itemAvailability: async (req, res) => {
        const itemId = req.params.id;

        try {
            // Find the supplier by its ID
            const item = await Item.findById(itemId);

            if (!supplier) {
                return res.status(404).json({ message: 'Item not found' });
            }

            // Toggle the isAvailable field
            item.isAvailable = !item.isAvailable;

            // Save the changes
            await item.save();

            res.status(200).json({ message: 'Availability toggled successfully' });
        } catch (error) {
            res.status(500).json(error);
        }
    },

    updateItemById: async (req, res) => {
        const itemId = req.params.id;

        try {
            const updatedItem = await Item.findByIdAndUpdate(itemId, req.body, { new: true, runValidators: true });

            if (!updatedItem) {
                return res.status(404).json({ status: false, message: 'Item item not found' });
            }

            res.status(200).json({ status: true, message: 'Item item successfully updated' });
        } catch (error) {
            res.status(500).json(error);
        }
    },

    addItemTag: async (req, res) => {
        const itemId = req.params.id;
        const { tag } = req.body;  // Assuming the tag to be added is sent in the request body

        if (!tag) {
            return res.status(400).json({ status: false, message: 'Tag is required' });
        }

        try {
            const item = await Item.findById(itemId);

            if (!item) {
                return res.status(404).json({ status: false, message: 'Item item not found' });
            }

            // Check if tag already exists
            if (item.itemTags.includes(tag)) {
                return res.status(400).json({ status: false, message: 'Tag already exists' });
            }

            item.itemTags.push(tag);
            await item.save();

            res.status(200).json({ status: true, message: 'Tag successfully added', data: item });
        } catch (error) {
            res.status(500).json(error);
        }
    },


    getRandomItemsByCode: async (req, res) => {
        try {
            let randomItemList = [];
    
            // Check if code is provided in the params
            if (req.params.code) {
                randomItemList = await Item.aggregate([
                    { $match: { code: req.params.code } },
                    { $sample: { size: 3 } },
                    { $project: {  __v: 0 } }
                ]);
            }
            
            // If no code provided in params or no Items match the provided code
            if (!randomItemList.length) {
                randomItemList = await Item.aggregate([
                    { $sample: { size: 5 } },
                    { $project: {  __v: 0 } }
                ]);
            }
    
            // Respond with the results
            if (randomItemList.length) {
                res.status(200).json(randomItemList);
            } else {
                res.status(404).json({status: false, message: 'No Items found' });
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },


    addItemType: async (req, res) => {
        const itemId = req.params.id;
        const { itemType } = req.body.itemType;  // Assuming the tag to be added is sent in the request body


        try {
            const item = await Item.findById(itemId);

            if (!item) {
                return res.status(404).json({ status: false, message: 'Item item not found' });
            }

            // Check if tag already exists
            if (item.itemType.includes(itemType)) {
                return res.status(400).json({ status: false, message: 'Type already exists' });
            }

            item.itemType.push(itemType);
            await item.save();

            res.status(200).json({ status: true, message: 'Type successfully added' });
        } catch (error) {
            res.status(500).json(error);
        }
    },

    getRandomItemsByCategoryAndCode: async (req, res) => {
        const { category, code } = req.params;  // Assuming category, code, and value are sent as parameters

        try {
            let items = await Item.aggregate([
                { $match: { category: category } },
                { $sample: { size: 10 } }
            ]);

            if (!items || items.length === 0) {
                items = await Item.aggregate([
                    { $match: { code: code } },
                    { $sample: { size: 10 } }
                ]);
            } else {
                items = await Item.aggregate([
                    { $sample: { size: 10 } }
                ]);
            }

            res.status(200).json(items);
        } catch (error) {
            res.status(500).json({ error: error.message, status: false });
        }
    },

    getItemsByCategoryAndCode: async (req, res) => {
        const { category, code } = req.params;  // Assuming category, code, and value are sent as parameters
        try {
            const items = await Item.aggregate([
                { $match: { category: category } },
            ]);

            if(items.length === 0){
                return res.status(200).json([])
            }

            res.status(200).json(items);
        } catch (error) {
            res.status(500).json({ error: error.message, status: false });
        }
    },

    searchItems: async (req, res) => {
        const search = req.params.item
        const regexPattern = new RegExp(search, 'i');
        try {
            // First, use MongoDB Atlas full-text search
            const itemsResults = await Item.aggregate([
                // {
                //     $search: {
                //         index: "items", // Items search index
                //         text: {
                //             query: search,
                //             path: {
                //                 wildcard: "*"  // Search across all fields
                //             }
                //         }
                //     }
                // },
                {
                    $match: {
                        $or: [
                            { itemName: regexPattern },  // Assuming your fields in items
                            { description: regexPattern }
                        ]
                    }
                }
            ]);

            // MongoDB Atlas Search for Suppliers
            const suppliersResults = await Supplier.aggregate([
                // {
                //     $search: {
                //         index: "suppliers", // Suppliers search index
                //         text: {
                //             query: search,
                //             path: {
                //                 wildcard: "*"  // Search across all fields
                //             }
                //         }
                //     }
                // },
                {
                    $match: {
                        $or: [
                            { title: regexPattern }
                        ]
                    }
                }
            ]);

            // Combine both results if needed or prioritize one over the other
            const combinedResults = [...itemsResults, ...suppliersResults];

            // Remove duplicates using _id
            const uniqueResults = Array.from(new Map(combinedResults.map(item => [item._id.toString(), item])).values());

            res.status(200).json({
                items: itemsResults,
                suppliers: suppliersResults
            });
        } catch (error) {
            res.status(500).json({ error: error.message, status: false });
        }
    },

}