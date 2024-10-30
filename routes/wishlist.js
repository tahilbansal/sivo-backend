const router = require("express").Router();
const wishlistController = require("../controllers/wishlistController");
const { verifyTokenAndAuthorization } = require("../middlewares/verifyToken");

// Add item to wishlist
router.post("/add", verifyTokenAndAuthorization, wishlistController.addFavItem);

// Remove item from wishlist
router.post("/remove", verifyTokenAndAuthorization, wishlistController.remFavItem);

// Get all wishlist items for a user
router.get("/", verifyTokenAndAuthorization, wishlistController.getWishlistItems);

module.exports = router;
