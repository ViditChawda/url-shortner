import { NextResponse } from "next/server";
import redis, { connectRedis } from "@/lib/redis";

const TEST_KEY = "url-shortener:health-check";
const TEST_VALUE = "ok";

export async function GET() {
  try {
    await connectRedis();

    // Test write
    await redis.set(TEST_KEY, TEST_VALUE, { EX: 10 });

    // Test read
    const value = await redis.get(TEST_KEY);

    // Clean up
    await redis.del(TEST_KEY);

    if (value !== TEST_VALUE) {
      return NextResponse.json(
        { success: false, error: "Read value did not match" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Redis is working correctly",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
