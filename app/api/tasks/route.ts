import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";

export async function GET() {
  try {
    await dbConnect();
    const tasks = await Task.find().sort({ createdAt: -1 }).lean().exec();
    return NextResponse.json({ success: true, tasks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    const { title, description, category, createdFrom } = data;
    if (!title) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }
    const task = await Task.create({
      title,
      description,
      status: "pending",
      category: category || "general",
      createdFrom: createdFrom || "manual",
    });
    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    const { id, status } = data;
    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing id or status" },
        { status: 400 }
      );
    }
    if (!["pending", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const task = await Task.findByIdAndUpdate(id, { status }, { new: true })
      .lean()
      .exec();
    if (!task)
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json({ success: true, task });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
