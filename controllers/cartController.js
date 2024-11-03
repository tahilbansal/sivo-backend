const Cart = require('../models/Cart');
const Item = require('../models/Item');

module.exports = {

    addProductToCart: async (req, res) => {
        const userId = req.user.id;
        const {  productId, quantity } = req.body;
        let count;
        try {
            const product = await Item.findById(productId);
            if (!product) {
                return res.status(404).json({ status: false, message: 'Product not found' });
            }

            const productPrice = product.price;
            const supplierId = product.supplier;

            const existingCart = await Cart.findOne({ userId, supplierId });

            if (existingCart) {
                // Check if the product already exists in the cart
                const existingProduct = existingCart.items.find(item => item.productId.equals(productId));

                if (existingProduct) {
                    // Increment the quantity if the product exists
                    existingProduct.quantity += 1;
                    existingProduct.totalPrice = existingProduct.quantity * productPrice;
                } else {
                    existingCart.items.push({
                        productId: productId,
                        quantity: quantity,
                        totalPrice: productPrice * quantity,
                    });
                }
                // Update grandTotal by summing totalPrice of all items
                existingCart.grandTotal = existingCart.items.reduce((acc, item) => acc + item.totalPrice, 0);

                await existingCart.save();
            }else {
                // Create a new cart for this user and supplier
                const newCartEntry = new Cart({
                    userId: userId,
                    supplierId: supplierId,
                    items: [{
                        productId: productId,
                        quantity: quantity,
                        totalPrice: productPrice * quantity,
                    }],
                    grandTotal: productPrice * quantity,
                });
                await newCartEntry.save();
            }
            // Count the total number of products in the cart for the user
            count = await Cart.countDocuments({ userId });

            res.status(201).json({ status: true, count: count });
        } catch (error) {
            res.status(500).json(error);
        }
    },

    removeProductFromCart: async (req, res) => {
        const productId = req.params.id;  // The product ID to remove
        const userId = req.user.id;  // The ID of the logged-in user
        //const supplierId = req.body.supplierId;  // Assuming the supplierId is passed in the body

        try {
            const product = await Item.findById(productId);
            const supplierId = product.supplier;
            // Find the cart for the specific user and supplier
            const userCart = await Cart.findOne({ userId, supplierId });

            // If the cart doesn't exist, return an error
            if (!userCart) {
                return res.status(404).json({ status: false, message: "Cart not found" });
            }

            // Find the index of the product in the cart
            const productIndex = userCart.items.findIndex(item => item.productId.toString() === productId);

            // If the product doesn't exist in the cart, return an error
            if (productIndex === -1) {
                return res.status(404).json({ status: false, message: "Product not found in cart" });
            }

            // Remove the product from the items array
            userCart.items.splice(productIndex, 1);

            // If there are no more items left in the cart, delete the cart itself
            if (userCart.items.length === 0) {
                await Cart.deleteOne({ userId, supplierId });
                return res.status(200).json({ status: true, message: "Cart is empty and has been deleted", count: 0 });
            }

            // Save the updated cart
            await userCart.save();

            // Get the updated count of cart items
            const count = userCart.items.length;

            // Return success response with updated count
            res.status(200).json({ status: true, count: count });
        } catch (error) {
            // Handle any potential errors
            res.status(500).json({ status: false, message: error.message });
        }
    },

    fetchUserCart: async (req, res) => {
        const userId = req.user.id;
        const supplierId = req.query.supplierId;

        try {
            const query = { userId };

            if (supplierId) {
                query.supplierId = supplierId;
            }

            const userCart = await Cart.find(query)
            .populate({
                path: 'items.productId',
                select: "imageUrl title supplier price",
                populate: {
                    path: 'supplier',
                    select: "time coords"
                }
            })
            const count = await Cart.countDocuments({userId: userId });

            res.status(200).json(userCart);
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    clearUserCart: async (req, res) => {
        const userId = req.user.id;
        const supplierId = req.query.supplierId;

        try {
            if (supplierId) {
                await Cart.deleteMany({ userId, supplierId });
            } else {
                // If no supplierId, clear the entire cart for the user
                await Cart.deleteMany({ userId });
            }
            res.status(200).json({ status: true, message: 'User cart cleared successfully' });
        } catch (error) {
            res.status(500).json(error);
        }
    },

    getCartCount: async (req, res) => {
        const userId = req.user.id;
    
        try {
            const count = await Cart.countDocuments({ userId: userId });
            res.status(200).json({ status: true, cartCount: count });
        } catch (error) {
            res.status(500).json(error);
        }
    },

    decrementProductQuantity: async (req, res) => {
        const userId = req.user.id;
        const productId = req.body.productId;
        let count;

        try {
            const product = await Item.findById(productId);
            const supplierId = product.supplier;
            // Find the cart associated with the user and supplier
            const cart = await Cart.findOne({ userId, supplierId });

            // If no cart exists for the user and supplier, return an error
            if (!cart) {
                return res.status(404).json({ status: false, message: 'Cart not found' });
            }

            // Find the product within the cart's items array
            const cartItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

            // If the product doesn't exist in the cart, return an error
            if (cartItemIndex === -1) {
                return res.status(404).json({ status: false, message: 'Product not found in cart' });
            }

            const cartItem = cart.items[cartItemIndex];

            // Calculate the price of a single product (totalPrice / quantity)
            const productPrice = cartItem.totalPrice / cartItem.quantity;

            // If quantity is more than 1, decrement and adjust price
            if (cartItem.quantity > 1) {
                cartItem.quantity -= 1;
                cartItem.totalPrice -= productPrice;
            }
            // If quantity is 1, remove the item from the cart
            else if (cartItem.quantity === 1) {
                // Remove the item from items
                cart.items.splice(cartItemIndex, 1);
            }

            // Update grandTotal by summing totalPrice of all items
            cart.grandTotal = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

            // If no items are left in the cart, delete the cart
            if (cart.items.length === 0) {
                await Cart.deleteOne({ userId, supplierId });
                return res.status(200).json({ status: true, message: 'Cart is empty and has been deleted' , count:0});
            }

            await cart.save();
            count = await Cart.countDocuments({ userId });

            res.status(200).json({
                status: true,
                message: cartItem.quantity > 1 ? 'Product quantity decreased successfully' : 'Product removed from cart',
                count: count // Return the updated item count
            });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }

};