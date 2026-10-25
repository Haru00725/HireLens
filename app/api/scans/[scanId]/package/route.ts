import { NextRequest, NextResponse } from "next/server";
import { updateScanPackage } from "@/lib/scan-store";
import { errorResponse, Errors } from "@/lib/errors";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  try {
    const { scanId } = await params;
    const body = await req.json();
    const packageType = body.packageType;

    if (packageType !== "scan_only" && packageType !== "bundle") {
      throw Errors.INVALID_STATE("package", packageType);
    }

    const updated = await updateScanPackage(scanId, packageType);

    return NextResponse.json({
      scanId: updated.id,
      selectedPackage: packageType,
      amountPaise: updated.amount_paise,
      currency: updated.currency,
    });
  } catch (err) {
    const resp = errorResponse(err);
    return NextResponse.json(resp, { status: resp.status });
  }
}
