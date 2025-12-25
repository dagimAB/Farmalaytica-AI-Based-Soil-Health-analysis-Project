import mongoose, { Schema, Document } from "mongoose";

export interface IFarmSettings extends Document {
  name: string;
  areaHa: number;
  primaryCrop: string;
  updatedAt: Date;
}

const FarmSettingsSchema: Schema = new Schema({
  name: { type: String, default: "My Farm" },
  areaHa: { type: Number, default: 1 },
  primaryCrop: { type: String, default: "Maize" },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.FarmSettings ||
  mongoose.model<IFarmSettings>("FarmSettings", FarmSettingsSchema);
