import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
export const signUp = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password || password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Please write all fields" });
    }
    const user = await UserModel.create(req.body);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt;
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
  res.send("signup route");
};
export const login = (req, res) => {
  res.send("login route");
};
export const logout = (req, res) => {
  res.send("logout route");
};
