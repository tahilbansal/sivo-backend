const Wishlist = require("../models/Wishlist");
const Item = require("../models/Item");

module.exports = {
    // Add an item to the user's wishlist
    addFavItem: async (req, res) => {
        const itemId = req.body.itemId;
        const userId = req.user.id;

        try {
            // Find or create a wishlist for the user
            let wishlist = await Wishlist.findOne({ userId });

            // If no wishlist exists, create a new one
            if (!wishlist) {
                wishlist = new Wishlist({ userId, items: [] });
            }

            // Check if item already exists in the wishlist
            const itemExists = wishlist.items.some(
                (wishlistItem) => wishlistItem.itemId.toString() === itemId
            );

            if (!itemExists) {
                // Add the item to the wishlist and save it
                wishlist.items.push({ itemId });
                await wishlist.save();

                return res.status(200).json({ message: 'Item added to wishlist', wishlist });
            } else {
                return res.status(400).json({ message: 'Item is already in the wishlist' });
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Remove an item from the user's wishlist
    remFavItem: async (req, res) => {
        const userId = req.user.id;
        const itemId = req.body.itemId;

        try {
            // Find the user's wishlist
            const wishlist = await Wishlist.findOne({ userId });

            if (wishlist) {
                // Filter out the item from the wishlist items
                wishlist.items = wishlist.items.filter(
                    (wishlistItem) => wishlistItem.itemId.toString() !== itemId
                );

                await wishlist.save();
                return res.status(200).json({ message: 'Item removed from wishlist', wishlist });
            } else {
                return res.status(404).json({ message: 'Wishlist not found for user' });
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Get all wishlist items for a user with complete item details
    getWishlistItems: async (req, res) => {
        const userId = req.user.id;
        const { supplierId } = req.query;

        try {
            const wishlist = await Wishlist.findOne({ userId }).populate({
                path: 'items.itemId',
                model: 'Item',
                match: { supplier: supplierId }, // Filter by supplier ID
            });

            if (wishlist) {
                // Filter out any null items (in case some items don't match the supplier)
                const items = wishlist.items
                    .filter((wishlistItem) => wishlistItem.itemId != null)
                    .map((wishlistItem) => wishlistItem.itemId); // Return the entire item

                res.status(200).json({ items });
            } else {
                res.status(404).json({ message: 'Wishlist not found for user' });
            }
        } catch (error) {
            console.error('Error fetching wishlist items:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
};
