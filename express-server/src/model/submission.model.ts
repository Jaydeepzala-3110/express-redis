import { model, Schema } from "mongoose";

const submissionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    problem: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },

    code: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      enum: ["JavaScript", "Python", "Java"],
      default: "JavaScript",
    },

    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Failed"],
      default: "Pending",
    },

    testCasesPassed: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Submission = model("Submission", submissionSchema);
