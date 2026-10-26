import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "6px",
        }}
      >
        <svg
          viewBox="0 0 200 200"
          width="24"
          height="24"
        >
          <circle cx="82" cy="82" r="66" fill="#C8F169" stroke="#111318" strokeWidth="12" />
          <path d="M38 70a46 46 0 0 1 30-30" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" opacity="0.8" />
          <line x1="130" y1="130" x2="182" y2="182" stroke="#C8F169" strokeWidth="26" strokeLinecap="round" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
