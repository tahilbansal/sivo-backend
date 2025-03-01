const router = require("express").Router();
const healthController = require("../controllers/healthController");

// HEALTH
router.get("/health", healthController.healthCheck);

module.exports = router