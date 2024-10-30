const router = require("express").Router();
const itemController = require("../controllers/itemController");
const {verifyTokenAndAuthorization, verifyVendor}= require("../middlewares/verifyToken")


// UPADATE category
router.get('/supplier-items/:id', itemController.getItemList)

router.post("/", verifyVendor , itemController.addItem);

router.post("/update/:id" ,verifyVendor, itemController.updateItemById);

router.post("/tags/:id", itemController.addItemTag);

router.post("/type/:id", itemController.addItemType);

router.get("/:id", itemController.getItemById);

router.get("/search/:item", itemController.searchItems);

router.get("/categories/:category/:code", itemController.getItemsByCategoryAndCode);

router.get("/:category/:code", itemController.getRandomItemsByCategoryAndCode);

router.delete("/:id", itemController.deleteItemById);

router.patch("/:id", itemController.itemAvailability);


router.get("/recommendation/:code", itemController.getRandomItemsByCode);



module.exports = router