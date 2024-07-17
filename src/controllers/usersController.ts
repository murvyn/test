import { Request, Response } from "express";
import User from "../models/userModel";
import { IUser } from "../types/types";
import mongoose from "mongoose";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as IUser;
    const allUsers = await User.find({ _id: { $ne: currentUser?._id } })
      .select("id firstName lastName indexNumber courses role")
      .exec();

    const currentUserCourseIds = currentUser?.courses?.map(
      (course) => course._id
    );

    const users = allUsers.filter((user) =>
      user.courses?.some((course) =>
        currentUserCourseIds?.some((currentCourseId) =>
          (course._id as any).equals(currentCourseId)
        )
      )
    );

    res.status(200).json({ users });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while retrieving users." });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { recipientId } = req.params;
    const user = await User.findById(recipientId)
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while retrieving user." });
  }
};
