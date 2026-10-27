
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (
  req,
  res,
  next
) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message:
          "Authentication required",
      });
    }

    const token =
      authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message:
          "Token missing",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (jwtError) {
      console.error(
        "JWT ERROR:",
        jwtError.name,
        jwtError.message
      );

      if (
        jwtError.name ===
        "TokenExpiredError"
      ) {
        return res.status(401).json({
          message:
            "Token expired. Please login again.",
        });
      }

      return res.status(401).json({
        message:
          "Invalid token. Please login again.",
      });
    }

    const user =
      await User.findById(
        decoded.id
      ).select("-password");

    if (!user) {
      return res.status(401).json({
        message:
          "User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(
      "AUTH MIDDLEWARE ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Authentication error",
    });
  }
};

export default protect;

