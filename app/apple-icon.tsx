import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111318",
          borderRadius: "36px",
        }}
      >
        <svg
          viewBox="0 0 200 200"
          width="130"
          height="130"
        >
          <circle cx="82" cy="82" r="66" fill="#C8F169" stroke="#111318" strokeWidth="10" />
          <path d="M38 70a46 46 0 0 1 30-30" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" opacity="0.8" />
          <rect x="52" y="60" width="12" height="12" fill="#111318" opacity="0.2" />
          <rect x="72" y="60" width="12" height="12" fill="#111318" opacity="0.2" />
          <rect x="52" y="80" width="12" height="12" fill="#111318" opacity="0.2" />
          <rect x="96" y="96" width="12" height="12" fill="#111318" />
          <line x1="132" y1="132" x2="186" y2="186" stroke="#C8F169" strokeWidth="26" strokeLinecap="round" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
