import jwt from "jsonwebtoken";
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: jwt.JwtPayload 
    }
  }
}
