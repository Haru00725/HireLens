/** GET /api/scans/[scanId] — Get scan status and report */

import { NextRequest, NextResponse } from "next/server";
import { getScanPublic } from "@/lib/scan-store";
import { scanIdSchema } from "@/lib/validation";
import { errorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> },
) {
  try {
    const { scanId } = await params;
    scanIdSchema.parse(scanId);
    const scan = await getScanPublic(scanId);
    return NextResponse.json(scan);
  } catch (err) {
    const resp = errorResponse(err);
    return NextResponse.json(resp, { status: resp.status });
  }
}
