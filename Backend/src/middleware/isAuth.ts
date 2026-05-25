import type {
  Request,
  Response,
  NextFunction,
} from "express";

import jwt from "jsonwebtoken";



interface JwtPayload {
  id: string;
}



export interface AuthRequest
  extends Request {

  userId?: string;
}



const isAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {

  try {

    const accessToken =
      req.cookies.accessToken;

    if (!accessToken) {

      return res.status(401).json({
        message: "Unauthorized user",
      });
    }

    const decoded =
      jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      ) as JwtPayload;

    if (!decoded) {

      return res.status(401).json({
        message: "Invalid token",
      });
    }

    req.userId = decoded.id;

    next();

  } catch (error) {

    return res.status(401).json({
      message: "Token verification failed",
    });
  }
};

export default isAuth;