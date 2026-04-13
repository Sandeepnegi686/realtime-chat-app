import UserModel from "../models/user.model.js";
import MessageModel from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const users = await UserModel.find({ _id: { $ne: req.user._id } });
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ sucess: false, message: "something went wrong" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const messages = await MessageModel.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort();
    return res.status(200).json({ success: true, messages });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ sucess: false, message: "something went wrong" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    let imageUrl;
    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadedResponse.secure_url;
    }

    const message = new MessageModel({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await message.save();

    //Todo: realTime functionallity
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    return res
      .status(201)
      .json({ success: true, message: "Message is created", message });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ sucess: false, message: "something went wrong" });
  }
};
