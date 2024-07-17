import { Request, Response } from "express";
import Chat from "../models/chatModel";
import User from "../models/userModel";
import { logger } from "../startup/logger";
import mongoose from "mongoose";
import Course from "../models/courseModel";

export const createChat = async (req: Request, res: Response) => {
  try {
    const currentUser = await User.findById(req.user?._id);
    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found" });
    }

    const { userId } = req.params;

    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ error: "Other user not found" });
    }

    const existingChat = await Chat.findOne({
      members: { $all: [currentUser._id, otherUser._id] },
      type: "direct",
    });

    if (existingChat) {
      return res
        .status(400)
        .json({ error: "Chat already exists between the users" });
    }

    if (!currentUser.courses || !otherUser.courses) {
      return res.status(400).json({ error: "Courses not populated correctly" });
    }

    const commonCourses = currentUser.courses.filter((course: any) =>
      otherUser.courses.some((otherCourse: any) =>
        course._id.equals(otherCourse._id)
      )
    );

    if (commonCourses.length === 0) {
      return res.status(400).json({
        error: "Both users must share at least one course to create a chat",
      });
    }

    const commonCourseIds = commonCourses?.map((course: any) => course._id);

    const chat = new Chat({
      members: [currentUser._id, otherUser._id],
      type: "direct",
      courses: commonCourseIds,
      messages: [],
      department: currentUser.department._id,
    });

    await chat.save();
    res
      .status(201)
      .json({ message: "Direct message chat successfully created", chat });
  } catch (error) {
    logger.error((error as Error).message);
    res.status(500).json({ error: "Failed to create chat" });
  }
};

export const getChats = async (req: Request, res: Response) => {
  try {
    const chats = await Chat.find({ members: req.user?._id });
    res.status(200).json({ message: "Chats successfully fetched", chats });
  } catch (error) {
    logger.error((error as Error).message);
    res.status(500).json({ error: "Failed to get chats" });
  }
};

export const addMessage = async (req: Request, res: Response) => {
  try {
    const { chatId, text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid chat id" });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const newMessage = {
      sender: req.user?._id,
      text,
      createdAt: new Date(),
    };

    chat.messages.push(newMessage);
    await chat.save();

    res.status(200).json({ message: "message sent", chat });
  } catch (error) {
    logger.error((error as Error).message);
    res.status(500).json({ error: "Failed to send message" });
  }
};

export const createCourseChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId).populate("courses");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userCourses = user.courses;

    if (!userCourses || userCourses.length === 0) {
      return res.status(400).json({ error: "User is not enrolled in any courses" });
    }

    const userCourseIds = userCourses.map(course => course._id);

    const groupChats = await Chat.find({ courses: { $in: userCourseIds }, type: "course" });

    for (const courseId of userCourseIds) {
      let groupChat = groupChats.find(chat => chat.courses?.includes(courseId));
      const courseUsers = await User.find({ "courses._id": courseId });
      const course = await Course.findById(courseId)

      if (!groupChat) {
        groupChat = new Chat({
          members: [userId],
          type: "course",
          courses: [courseId],
          messages: [],
          department: user.department._id,
          name: course?.name
        });
      } else {
        const newMembers: any = courseUsers.map(courseUser => courseUser._id).filter((userId: any )=> !groupChat?.members.includes(userId));
        groupChat.members.push(...newMembers);
      }

      await groupChat.save();
    }

    res.status(200).json({ message: "Group chats managed successfully" });
  } catch (error) {
    logger.error((error as Error).message);
    res.status(500).json({ error: "Failed to manage group chats" });
  }
};
