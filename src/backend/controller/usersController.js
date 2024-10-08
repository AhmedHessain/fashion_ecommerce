import { catchAsync } from "../utils/captureErrors";
import User from "../model/userModel";
import { NextResponse } from "next/server";

export const getAllUsers = catchAsync(async (req, event, next) => {
  const users = await User.find({});

  return NextResponse.json({ data: users }, { status: 200 });
});
