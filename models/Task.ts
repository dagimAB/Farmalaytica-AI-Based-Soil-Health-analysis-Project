import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  status: "pending" | "completed";
  category?: string;
  createdFrom?: string;
  createdAt: Date;
}

const TaskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
  category: { type: String, default: "general" },
  createdFrom: { type: String, default: "manual" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Task ||
  mongoose.model<ITask>("Task", TaskSchema);
