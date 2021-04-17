const router = require("express").Router();
const userCtrl = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth");

/**API TO REGISTER A USER */
router.post("/register", authMiddleware, userCtrl.registerUser);

/** API TO LOGIN A USER*/
router.post("/login", authMiddleware, userCtrl.loginUser);

/**API TO CHECK AUTHENTICATION OF A USER */
router.get("/auth", authMiddleware, userCtrl.checkAuth);

/** API TO LOGOUT A USER */
router.post("/logout", authMiddleware, userCtrl.logoutUser);

/** API TO GENERATE NEW ACCESS TOKEN FROM REFRESH TOKEN */
router.post("/accesstoken", authMiddleware, userCtrl.renewAccessToken);

/** API TO CHANGE PASSWORD OF A USER */
router.post("/change", authMiddleware, userCtrl.changePassword);

/** API TO SAVE SOME TEXT ON DATABASE */
router.post("/text", authMiddleware, userCtrl.saveText);

module.exports = router;