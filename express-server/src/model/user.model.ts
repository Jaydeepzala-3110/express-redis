import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    avatar: {
      url: String,
      default: "",
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    rank: {
      type: Number,
      default: 0,
    },
    solvedProblems: [
      {
        type: Schema.Types.ObjectId,
        ref: "Solution",
      },
    ],
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
