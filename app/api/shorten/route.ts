// app/api/shorten/route.ts

import { NextResponse } from "next/server";
import { encodeBase62 } from "@/lib/shortCode";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { message: "Server misconfigured: DATABASE_URL is not set", error: "DATABASE_URL is not set" },
        { status: 503 }
      );
    }

    const body = await req.json();
    const longUrl = typeof body?.longUrl === "string" ? body.longUrl.trim() : "";

    if (!longUrl) {
      return NextResponse.json(
        { message: "longUrl is required" },
        { status: 400 }
      );
    }

    const created = await prisma.url.create({
      data: {
        longUrl,
      },
    });

    const shortCode = encodeBase62(created.id);

    const updated = await prisma.url.update({
      where: { id: created.id },
      data: { shortCode },
    });

    const baseUrl =
      process.env.BASE_URL ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000");
    const shortUrl = `${baseUrl}/${shortCode}`;

    return NextResponse.json({
      shortUrl,
      data: updated,
    });
  } catch (err) {
    console.error("[POST /api/shorten]", err);
    const rawMessage = err instanceof Error ? err.message : "Internal Server Error";
    const isDbUnreachable =
      /Can't reach database server|Connection refused|ETIMEDOUT|ENOTFOUND/.test(rawMessage);
    const message = isDbUnreachable
      ? "Database unreachable. Check that it's running and that this server can connect (security group, VPN, or use a local DB for development)."
      : rawMessage;
    return NextResponse.json(
      { message: "Failed to shorten URL", error: message },
      { status: 500 }
    );
  }
}