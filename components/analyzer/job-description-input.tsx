"use client";

import { JOB_DESC_MIN, JOB_DESC_MAX } from "@/lib/validation";
import { AlertCircle, FileText } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function JobDescriptionInput({ value, onChange }: Props) {
  const charCount = value.length;
  const isTooShort = charCount > 0 && charCount < JOB_DESC_MIN;
  const isTooLong = charCount > JOB_DESC_MAX;

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">Job description</h2>
          <p className="mt-1 text-sm text-muted">
            Paste the target role description, requirements, or posting.
          </p>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs text-muted">
          <FileText size={14} />
          <span>
            {charCount.toLocaleString()} / {JOB_DESC_MAX.toLocaleString()} chars
          </span>
        </div>
      </div>

      <div className="relative mt-4">
        <textarea
          rows={10}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste the full job posting here (including role summary, required skills, qualifications, and responsibilities)..."
          className={`w-full rounded-[6px] border-2 bg-paper p-4 text-sm font-sans text-ink transition-colors placeholder:text-muted/60 focus:outline-none ${
            isTooLong
              ? "border-amber-600 focus:border-amber-600"
              : isTooShort
              ? "border-amber-400 focus:border-amber-500"
              : "border-line focus:border-ink"
          }`}
        />

        {isTooShort && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700">
            <AlertCircle size={14} />
            <span>
              Please enter at least {JOB_DESC_MIN} characters ({JOB_DESC_MIN - charCount} more needed) so the AI can extract key requirements.
            </span>
          </div>
        )}

        {isTooLong && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700">
            <AlertCircle size={14} />
            <span>
              Job description exceeds {JOB_DESC_MAX.toLocaleString()} characters. Please trim non-essential sections.
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-[6px] border border-line bg-line/20 p-3.5 text-xs text-muted">
        <p className="font-medium text-ink">💡 Tip for accurate analysis:</p>
        <p className="mt-1">
          Include the "Required Qualifications", "Responsibilities", and "Nice-to-haves". The AI parses these to evaluate evidence directly from your resume.
        </p>
      </div>
    </div>
  );
}
