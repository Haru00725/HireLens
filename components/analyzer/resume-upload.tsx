"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { RESUME_TEXT_MIN, MAX_FILE_SIZE_BYTES, ALLOWED_EXTENSIONS } from "@/lib/validation";

interface Props {
  mode: "file" | "text";
  onModeChange: (mode: "file" | "text") => void;
  file: File | null;
  onFileChange: (f: File | null) => void;
  text: string;
  onTextChange: (t: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResumeUpload({ mode, onModeChange, file, onFileChange, text, onTextChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((f: File): boolean => {
    setError(null);
    const ext = f.name.toLowerCase().slice(f.name.lastIndexOf("."));
    if (!ALLOWED_EXTENSIONS.includes(ext as typeof ALLOWED_EXTENSIONS[number])) {
      setError("Only PDF and DOCX files are supported.");
      return false;
    }
    if (f.size > MAX_FILE_SIZE_BYTES) {
      setError("File must be under 5 MB.");
      return false;
    }
    return true;
  }, []);

  const handleFile = useCallback(
    (f: File) => {
      if (validateFile(f)) {
        onFileChange(f);
        setError(null);
      }
    },
    [validateFile, onFileChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  return (
    <div>
      <h2 className="text-xl font-semibold">Your resume</h2>
      <p className="mt-1 text-sm text-muted">Upload a file or paste your resume text.</p>

      {/* Mode toggle */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onModeChange("file")}
          className={`rounded-[4px] px-4 py-2 text-sm font-medium transition-colors ${
            mode === "file" ? "bg-ink text-paper" : "bg-line/60 text-muted hover:text-ink"
          }`}
        >
          Upload file
        </button>
        <button
          onClick={() => onModeChange("text")}
          className={`rounded-[4px] px-4 py-2 text-sm font-medium transition-colors ${
            mode === "text" ? "bg-ink text-paper" : "bg-line/60 text-muted hover:text-ink"
          }`}
        >
          Paste text
        </button>
      </div>

      {mode === "file" ? (
        <div className="mt-4">
          {!file ? (
            <div
              role="button"
              tabIndex={0}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center gap-3 rounded-[6px] border-2 border-dashed p-10 text-center transition-colors ${
                dragActive ? "border-lime bg-lime/10" : "border-line hover:border-ink/40"
              }`}
            >
              <Upload size={32} className="text-muted" />
              <p className="font-medium">
                Drop your resume here or <span className="text-ink underline underline-offset-4">browse</span>
              </p>
              <p className="text-sm text-muted">PDF or DOCX · Max 5 MB</p>
            </div>
          ) : (
            <div className="flex items-center gap-4 rounded-[6px] border-2 border-ink/20 bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-lime">
                <FileText size={20} className="text-ink" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{file.name}</p>
                <p className="text-sm text-muted">{formatBytes(file.size)}</p>
              </div>
              <button
                onClick={() => { onFileChange(null); setError(null); }}
                className="rounded-full p-2 text-muted transition-colors hover:bg-line/60 hover:text-ink"
                aria-label="Remove file"
              >
                <X size={18} />
              </button>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </div>
      ) : (
        <div className="mt-4">
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Paste your resume text here..."
            rows={12}
            className="w-full resize-y rounded-[6px] border-2 border-line bg-white p-4 text-sm leading-relaxed transition-colors placeholder:text-muted/60 focus:border-ink focus:outline-none"
          />
          <div className="mt-1 flex justify-between text-xs text-muted">
            <span>
              {text.trim().length < RESUME_TEXT_MIN
                ? `Minimum ${RESUME_TEXT_MIN} characters`
                : "✓ Ready"}
            </span>
            <span>{text.length.toLocaleString()} characters</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-[4px] bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
