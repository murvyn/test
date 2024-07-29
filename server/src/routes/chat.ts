import { Router } from "express";
import { getChats, createChat, createCourseChat } from "../controllers/chatController";
import { auth } from "../middleware/auth";

const router = Router()

router.post('/create-direct-chat/:userId', auth(["student", "lecturer", "HOD"]), createChat)
router.post('/manage-course-chats', auth(["student", "lecturer", "HOD"]), createCourseChat)
router.get('/', auth(["student", "lecturer", "HOD"]), getChats)


export default router