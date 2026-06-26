import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res,next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success:false,
        message:"No token"
      });
    }
    const decoded = jwt.verify(token,SECRET);
    req.userId = decoded.id;
    next();

  } catch (error) {

    return res.status(401).json({
      success:false,
      message:"Unauthorized"
    });

  }
};