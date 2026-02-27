import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DUMMY_URLS = [
  { shortCode: "seed1", longUrl: "https://example.com" },
  { shortCode: "seed2", longUrl: "https://github.com" },
  { shortCode: "seed3", longUrl: "https://google.com" },
  { shortCode: "seed4", longUrl: "https://stackoverflow.com" },
  { shortCode: "seed5", longUrl: "https://developer.mozilla.org" },
];

export async function POST() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { message: "Server misconfigured: DATABASE_URL is not set" },
        { status: 503 }
      );
    }

    const created = await prisma.url.createMany({
      data: DUMMY_URLS,
      skipDuplicates: true,
    });

    return NextResponse.json({
      message: `Seed complete. Inserted ${created.count} dummy URL(s).`,
      count: created.count,
    });
  } catch (err) {
    console.error("[POST /api/seed]", err);
    const message = err instanceof Error ? err.message : "Failed to seed database";
    return NextResponse.json(
      { message: "Failed to seed dummy data", error: message },
      { status: 500 }
    );
  }
}
