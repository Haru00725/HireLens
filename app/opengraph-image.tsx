import { ImageResponse } from "next/og";

export const alt = "HireLens — Free ATS Resume Builder & AI Resume Matcher";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#111318",
          padding: "64px 72px",
          color: "#F7F7F0",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span
              style={{
                fontSize: "40px",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#F7F7F0",
              }}
            >
              HireLens
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgba(200, 241, 105, 0.15)",
                border: "1px solid #C8F169",
                borderRadius: "4px",
                padding: "6px 14px",
                color: "#C8F169",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              A Delusive Product
            </div>
          </div>
          <div
            style={{
              display: "flex",
              color: "#C8F169",
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "0.08em",
            }}
          >
            hirelens.delusive.studio
          </div>
        </div>

        {/* Center Content */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              maxWidth: "760px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                fontSize: "60px",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "#F7F7F0",
              }}
            >
              <span>See your resume through a&nbsp;</span>
              <span style={{ color: "#C8F169", fontStyle: "italic" }}>
                recruiter&apos;s lens.
              </span>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "22px",
                lineHeight: 1.4,
                color: "rgba(247, 247, 240, 0.78)",
                maxWidth: "680px",
              }}
            >
              AI-powered resume &amp; job-description matching with calibrated fit
              scores, plus a 100% free ATS-friendly resume builder with instant
              PDF export.
            </div>
          </div>

          {/* Lens Graphic */}
          <div
            style={{
              display: "flex",
              width: "200px",
              height: "200px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg viewBox="0 0 200 200" width="200" height="200">
              <circle
                cx="82"
                cy="82"
                r="66"
                fill="#C8F169"
                stroke="#111318"
                strokeWidth="9"
              />
              <path
                d="M38 70a46 46 0 0 1 30-30"
                fill="none"
                stroke="#ffffff"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.7"
              />
              <rect x="52" y="60" width="12" height="12" fill="#111318" opacity="0.2" />
              <rect x="72" y="60" width="12" height="12" fill="#111318" opacity="0.2" />
              <rect x="52" y="80" width="12" height="12" fill="#111318" opacity="0.2" />
              <rect x="96" y="96" width="12" height="12" fill="#111318" />
              <line
                x1="132"
                y1="132"
                x2="186"
                y2="186"
                stroke="#C8F169"
                strokeWidth="26"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: "24px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              backgroundColor: "#F7F7F0",
              color: "#111318",
              padding: "10px 18px",
              borderRadius: "4px",
              fontWeight: 700,
              fontSize: "15px",
            }}
          >
            Free ATS Resume Builder
          </div>
          <div
            style={{
              display: "flex",
              backgroundColor: "#C8F169",
              color: "#111318",
              padding: "10px 18px",
              borderRadius: "4px",
              fontWeight: 700,
              fontSize: "15px",
            }}
          >
            AI Resume &amp; Job Matcher
          </div>
          <div
            style={{
              display: "flex",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              color: "#F7F7F0",
              padding: "10px 18px",
              borderRadius: "4px",
              fontWeight: 600,
              fontSize: "15px",
              border: "1px solid rgba(255, 255, 255, 0.16)",
            }}
          >
            Zero-Training · In-Memory Privacy
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
