import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import {
  internalServerErrorResponse,
  notFoundResponse,
  successResponse,
} from "../utils/response.utils";
import { UserRole } from "../utils/enum.utils";
import { generateToken } from "../utils/jwt.utils";

export const signup = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role = UserRole.User,
    } = req.body;

    if (![UserRole.User, UserRole.Admin, UserRole.SuperAdmin].includes(role)) {
      return notFoundResponse(res, "Invalid role provided");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return notFoundResponse(res, "Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();

    const payload = {
      _id: user._id,
      role: user.role,
      status: user.status,
    };

    const accessToken = generateToken(
      payload,
      process.env.JWT_SECRET as string
    );

    return successResponse(res, "Signup successful", accessToken);
  } catch (error) {
    return internalServerErrorResponse(res, "Signup failed", error);
  }
};
