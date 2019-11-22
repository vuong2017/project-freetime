import express from "express";
const router = express.Router();

import user from "../../controllers/user";

router.post("/login", user.login);
router.post("/register", user.register);
router.post("/logout", user.logout);
router.post("/forgot_password", user.forgotPassword);
router.post("/reset_password", user.resetPassword);

export default router;
