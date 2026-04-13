import { model, Schema } from "mongoose";

const schema = Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    text: { type: String },
    image: {
      type: String,
    },
  },
  { timestamps: true },
);
const MessageModel = model("Message", schema);
export default MessageModel;
