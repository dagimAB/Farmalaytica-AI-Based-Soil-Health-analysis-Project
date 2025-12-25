import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SoilReading from "@/models/SoilReading";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    // Return the most recent 10 readings
    const readings = await SoilReading.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .exec();
    return NextResponse.json({ success: true, readings }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    const { nitrogen, phosphorus, potassium, pH, ec, moisture, temperature } =
      data;
    if (
      [nitrogen, phosphorus, potassium, pH, ec, moisture, temperature].some(
        (v) => v === undefined
      )
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const reading = await SoilReading.create({
      nitrogen,
      phosphorus,
      potassium,
      pH,
      ec,
      moisture,
      temperature,
    });
    return NextResponse.json({ success: true, reading }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
