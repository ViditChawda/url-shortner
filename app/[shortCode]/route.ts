import { NextRequest, NextResponse } from "next/server";
import { resolveShortCode } from "@/lib/redirectService";

/**
 * Pretty URL redirect: /abc123 → uses redirect service → long URL
 * Delegates to the same Redis → DB → cache logic as /api/redirect
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;

    if (!shortCode?.trim()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const longUrl = await resolveShortCode(shortCode);

    if (!longUrl) {
      return NextResponse.json({ error: "Short link not found" }, { status: 404 });
    }

    return NextResponse.redirect(longUrl, 307);
  } catch (error) {
    console.error("[GET /[shortCode]]", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: "Redirect failed", details: message },
      { status: 500 }
    );
  }
}
