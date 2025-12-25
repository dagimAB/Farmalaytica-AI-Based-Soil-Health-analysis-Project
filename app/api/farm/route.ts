import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import FarmSettings from "@/models/FarmSettings";

export async function GET() {
  try {
    await dbConnect();
    const settings = await FarmSettings.findOne().lean().exec();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    const { name, areaHa, primaryCrop } = data;
    let settings = await FarmSettings.findOne().exec();
    if (!settings) {
      settings = await FarmSettings.create({
        name,
        areaHa: Number(areaHa),
        primaryCrop,
      });
    } else {
      settings.name = name || settings.name;
      settings.areaHa = areaHa !== undefined ? Number(areaHa) : settings.areaHa;
      settings.primaryCrop = primaryCrop || settings.primaryCrop;
      settings.updatedAt = new Date();
      await settings.save();
    }
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
