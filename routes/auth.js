const router = require("express").Router();
const authController = require("../controllers/authContoller");


// REGISTRATION
router.post("/register", authController.createUser);

// LOGIN 
router.post("/login", authController.loginUser);

router.post("/sendOtp", authController.sendOtp);

//router.post("/verifyOtpAndRegister", authController.verifyOtpAndRegister);

router.post("/verifyTokenAndRegister", authController.verifyUserTokenAndRegister);

router.post("/verifyUserPhone", authController.verifyUser);

module.exports = router