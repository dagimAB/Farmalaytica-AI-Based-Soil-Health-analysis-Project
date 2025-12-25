import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Inventory from "@/models/Inventory";

export async function GET() {
  try {
    await dbConnect();
    const items = await Inventory.find().sort({ createdAt: -1 }).lean().exec();

    // Seed with default fertilizers if none exist
    if (!items || items.length === 0) {
      const seed = [
        { name: "Urea", quantityKg: 5 },
        { name: "DAP", quantityKg: 20 },
        { name: "MOP", quantityKg: 8 },
      ];
      await Inventory.insertMany(seed);
      const refreshed = await Inventory.find()
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      return NextResponse.json({ success: true, items: refreshed });
    }

    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    const { name, quantityKg } = data;
    if (!name)
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    const item = await Inventory.create({
      name,
      quantityKg: Number(quantityKg || 0),
    });
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    const { id, quantityKg } = data;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const item = await Inventory.findByIdAndUpdate(
      id,
      { quantityKg: Number(quantityKg) },
      { new: true }
    )
      .lean()
      .exec();
    if (!item)
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    return NextResponse.json({ success: true, item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
