import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res
        .status(400)
        .json({ sucess: false, message: "unAuthorized - No token Provided" });
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res
        .status(400)
        .json({ sucess: false, message: "unAuthorized - Token Invalid" });
    }
    const user = await UserModel.findById(decoded.userId);
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ sucess: false, message: "something went wrong" });
  }
};
