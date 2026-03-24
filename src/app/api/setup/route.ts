import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // Check if any user already exists
    const usersCount = await prisma.user.count();

    if (usersCount > 0) {
      return NextResponse.json(
        { message: "Setup already completed. Please use /admin/login." },
        { status: 403 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        message: "Admin user created successfully",
        user: { email: newUser.email },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Setup Error:", error);
    return NextResponse.json(
      { message: "An error occurred during setup" },
      { status: 500 },
    );
  }
}
