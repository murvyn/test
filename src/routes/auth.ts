import { Router } from "express";
import { forgotPassword, login, resetPasswordGet, resetPasswordPost } from "../controllers/authController";

const router = Router()

router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.get('/reset-password/:id/:token', resetPasswordGet)
router.post('/reset-password/:id/:token', resetPasswordPost)

export default router