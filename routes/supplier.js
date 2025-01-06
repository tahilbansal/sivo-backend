const router = require("express").Router();
const supplierController = require("../controllers/supplierController");
const { verifyTokenAndAuthorization, verifyVendor } = require("../middlewares/verifyToken");


// CREATE RESTAURANT
router.post("/",verifyTokenAndAuthorization,  supplierController.addSupplier);

router.post("/messagesByRes", supplierController.sendMessages);

router.get("/profile", verifyVendor, supplierController.getSupplierByOwner);

// Item price show or hide
router.patch("/price_visibility/:id",verifyVendor, supplierController.showItemPrice);

// Sevices availability
router.patch("/:id",verifyVendor, supplierController.serviceAvailability);


// GET RESTAURANT BY ID
router.get("/:code", supplierController.getRandomSuppliers);

// GET RESTAURANT BY ID
router.get("/all/:code", supplierController.getAllRandomSuppliers);

router.get("/categories/:category/:code", supplierController.getSuppliersByCategoryAndCode);

// GET ALL SUPPLIER
router.get("/byId/:id", supplierController.getSupplier);

router.get("/statistics/:id", supplierController.getStats);

router.post("/payout",verifyVendor, supplierController.createPayout);

module.exports = router