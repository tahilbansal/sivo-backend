const router = require("express").Router();
const supplierCategoryController = require("../controllers/supplierCategoryController");


// UPADATE category
router.put("/:id", supplierCategoryController.updateSupplierCategory);

router.post("/", supplierCategoryController.createSupplierCategory);

// DELETE category

router.delete("/:id", supplierCategoryController.deleteSupplierCategory);

// DELETE category
router.post("/image/:id", supplierCategoryController.patchSupplierCategoryImage);

// GET category
router.get("/", supplierCategoryController.getAllCategories);

// GET category
router.get("/random", supplierCategoryController.getRandomCategories);

// Add Skills



module.exports = router