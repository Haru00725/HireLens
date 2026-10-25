import { NextRequest, NextResponse } from "next/server";
import { aiAssistResumeWriter } from "@/lib/ai-resume-optimizer";
import { errorResponse, Errors } from "@/lib/errors";
import { rateLimitByIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip");
    const rl = rateLimitByIp(ip, "builder-ai", 15, 60_000);
    if (!rl.allowed) {
      const err = errorResponse(Errors.RATE_LIMITED());
      return NextResponse.json(err, { status: err.status });
    }

    const body = await req.json();
    const { action, currentText, targetRole, context } = body;

    if (!action || !["summary", "bullet_point", "project_rewrite", "grammar_clarity"].includes(action)) {
      return NextResponse.json({ error: "Invalid AI action" }, { status: 400 });
    }

    if (!currentText || typeof currentText !== "string") {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 });
    }

    const improved = await aiAssistResumeWriter({
      action,
      currentText: currentText.slice(0, 3000),
      targetRole: targetRole ? String(targetRole).slice(0, 150) : undefined,
      context: context ? String(context).slice(0, 1000) : undefined,
    });

    return NextResponse.json({
      improvedText: improved.trim(),
    });
  } catch (err) {
    const resp = errorResponse(err);
    return NextResponse.json(resp, { status: resp.status });
  }
}
