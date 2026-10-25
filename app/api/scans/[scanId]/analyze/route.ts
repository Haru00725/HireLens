/** POST /api/scans/[scanId]/analyze — Trigger analysis for a paid scan */

import { NextRequest, NextResponse } from "next/server";
import { runAnalysis } from "@/lib/analyze-resume";
import { getScanPublic } from "@/lib/scan-store";
import { scanIdSchema } from "@/lib/validation";
import { errorResponse } from "@/lib/errors";
import { rateLimitByIp } from "@/lib/rate-limit";
import { Errors } from "@/lib/errors";

export const runtime = "nodejs";
export const maxDuration = 60; // Allow up to 60s for AI analysis

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> },
) {
  try {
    const { scanId } = await params;
    scanIdSchema.parse(scanId);

    // Rate limit
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip");
    const rl = rateLimitByIp(ip, "analyze", 3, 60_000);
    if (!rl.allowed) {
      const err = errorResponse(Errors.RATE_LIMITED());
      return NextResponse.json(err, { status: err.status });
    }

    await runAnalysis(scanId);
    const scan = await getScanPublic(scanId);
    return NextResponse.json(scan);
  } catch (err) {
    const resp = errorResponse(err);
    return NextResponse.json(resp, { status: resp.status });
  }
}
