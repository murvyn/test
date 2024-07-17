import { Router } from "express";
import { auth } from "../middleware/auth";
import { getUser, getUsers } from "../controllers/usersController";

const router = Router();

router.get("/", auth(["student", "lecturer", "HOD"]), getUsers);
router.get("/:recipientId", auth(["student", "lecturer", "HOD"]), getUser);

// router.get('/', auth(["student", "lecturer", "HOD"]), getChats)

export default router;
