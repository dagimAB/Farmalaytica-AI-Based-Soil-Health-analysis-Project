import mongoose, { Schema, Document } from "mongoose";

export interface ISoilReading extends Document {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  pH: number;
  ec: number;
  moisture: number;
  temperature: number;
  createdAt: Date;
}

const SoilReadingSchema: Schema = new Schema({
  nitrogen: { type: Number, required: true },
  phosphorus: { type: Number, required: true },
  potassium: { type: Number, required: true },
  pH: { type: Number, required: true },
  ec: { type: Number, required: true },
  moisture: { type: Number, required: true },
  temperature: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.SoilReading ||
  mongoose.model<ISoilReading>("SoilReading", SoilReadingSchema);
