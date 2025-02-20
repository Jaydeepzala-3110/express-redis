import { model, Schema } from "mongoose";

const solutionSchema = new Schema(
  {
    submission: {
      type: Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
    },

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

    success: {
      type: Boolean,
      required: true,
    },

    output: {
      type: String,
    },

    error: {
      type: String,
    },

    executionTime: {
      type: Number,
      default: 0,
    },

    memoryUsage: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Failed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export const Solution = model("Solution", solutionSchema);
