import { NextRequest, NextResponse } from "next/server";
import { resolveShortCode } from "@/lib/redirectService";

/**
 * Redirect service API:
 * GET /api/redirect?code=abc123
 *
 * 1. Check Redis (cache) — if found → redirect immediately
 * 2. If not in Redis — query database
 * 3. Store in Redis (cache with TTL)
 * 4. Redirect user to long URL
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shortCode = searchParams.get("code");

    if (!shortCode?.trim()) {
      return NextResponse.json({ error: "Missing code parameter" }, { status: 400 });
    }

    const longUrl = await resolveShortCode(shortCode);

    if (!longUrl) {
      return NextResponse.json({ error: "Short link not found" }, { status: 404 });
    }

    return NextResponse.redirect(longUrl, 307);
  } catch (error) {
    console.error("[GET /api/redirect]", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: "Redirect failed", details: message },
      { status: 500 }
    );
  }
}
