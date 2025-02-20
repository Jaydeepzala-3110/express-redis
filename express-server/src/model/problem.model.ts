import { Schema, model } from "mongoose";

const exampleSchema = new Schema({
  input: {
    type: Schema.Types.Mixed,
    required: true,
  },
  output: {
    type: Schema.Types.Mixed,
    required: true,
  },
  explanation: {
    type: String,
  },
});

const problemSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },

    examples: [exampleSchema],

    tag: [{ type: String }],
  },
  { timestamps: true }
);

export const Problem = model("Problem", problemSchema);
