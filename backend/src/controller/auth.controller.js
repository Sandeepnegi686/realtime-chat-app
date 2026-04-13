import { generateToken } from "../lib/utils.js";
import UserModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signUp = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password || password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Please write all fields" });
    }
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exits" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new UserModel({
      fullName,
      email,
      password: hashedPassword,
    });
    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      return res.status(201).json({
        success: true,
        user: {
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          profilePic: newUser.profilePic,
        },
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Please write all fields" });
    }
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(500)
        .json({ success: false, message: "Invalid Credentials" });
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return res
        .status(500)
        .json({ success: false, message: "Invalid Credentials" });
    }
    generateToken(user._id, res);
    return res.status(200).json({
      sucess: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res
      .status(200)
      .json({ success: true, message: "Logout successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic) {
      return res
        .status(400)
        .json({ sucess: false, message: "Profile picture is not provided" });
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { returnDocument: "after" },
    );
    return res
      .status(200)
      .json({ success: true, message: "updated profile picture", updatedUser });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ sucess: false, message: "something went wrong" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    res.status(200).json({ success: false, user: req.user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ sucess: false, message: "something went wrong" });
  }
};
