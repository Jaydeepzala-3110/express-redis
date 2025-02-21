import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.utils";
import {
  notFoundResponse,
  unauthorizedResponse,
} from "../utils/response.utils";
import { User } from "../models/user.model";

export const auth =
  (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1] || null;

      if (!token) {
        return notFoundResponse(res, "Token not Found");
      }

      const decodedToken = verifyToken(token);

      if (!decodedToken || !decodedToken.role || !decodedToken.Type) {
        return unauthorizedResponse(res, "Access denied");
      }

      if (!roles.length) {
        return next();
      }

      const user = User.findOne({
        _id: decodedToken?._id,
        role: decodedToken?.role,
        status: decodedToken?.status,
      });

      if (!user) {
        return unauthorizedResponse(res, "Access denied");
      }

      req.authUser = user;

      if (!roles.includes(user.role)) {
        return unauthorizedResponse(res, "Access denied");
      }

      next();
    } catch (error) {
      return unauthorizedResponse(res, "Access denied");
    }
  };
