import mongoose, { Schema, Document } from "mongoose";

export interface IInventory extends Document {
  name: string;
  quantityKg: number;
  unit: string;
  createdAt: Date;
}

const InventorySchema: Schema = new Schema({
  name: { type: String, required: true },
  quantityKg: { type: Number, required: true, default: 0 },
  unit: { type: String, default: "kg" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Inventory ||
  mongoose.model<IInventory>("Inventory", InventorySchema);
