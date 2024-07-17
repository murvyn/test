import { Router } from "express";
import { addMessage } from "../controllers/chatController";
import { auth } from "../middleware/auth";

const router = Router()

router.post('/send-message', auth(["student", "lecturer", "HOD"]), addMessage)

export default router