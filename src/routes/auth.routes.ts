// src/routes/auth.routes.ts

import { Router } from "express";
import UserController from "../controller/user.controller";
import { registerValidation, loginValidation } from "../validators/user.validator";

import rateLimit from 'express-rate-limit';
import { upload } from "../middlewares/upload";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit to 5 requests per IP
  message: 'Too many login attempts, please try again later.',
});

const router = Router();

// Route for user registration
router.post("/register", upload.single("profile_image"), UserController.register);

// Route for user login
router.post("/login",loginLimiter, loginValidation, UserController.login);

// Route for refreshing the token
router.post("/refresh", UserController.refresh);

// // Route for checking authenticated user (requires authentication)
router.get("/me", UserController.authenticate);
router.post("/logout", UserController.logout)
router.get('/activate/:link', UserController.activate);
router.post("/forgot-password", UserController.forgotPassword);
router.post("/verify-code",UserController.verifyCode)
router.post("/reset-password", UserController.resetPassword);

export default router;