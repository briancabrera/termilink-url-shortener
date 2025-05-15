import { ImageResponse } from "next/og"

// Route segment config
export const runtime = "edge"

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"

// Image generation
export default function Icon() {
  return new ImageResponse(
    // ImageResponse JSX element
    <div
      style={{
        fontSize: 24,
        background: "black",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 24,
      }}
    >
      <svg width="120" height="120" viewBox="0 0 512 512">
        <rect width="512" height="512" rx="64" fill="#000000" />
        <path d="M120 256 L180 196 L180 226 L150 256 L180 286 L180 316 Z" fill="#4ade80" />
        <path
          d="M300 150 Q340 150 370 180 Q400 210 400 250 Q400 290 370 320 L340 350 L310 320 L340 290 Q355 275 355 250 Q355 225 340 210 Q325 195 300 195 L270 195 L240 225 L210 195 Q195 180 195 160 Q195 140 210 125 Q225 110 245 110 Q265 110 280 125 L300 145 L320 125 Q335 110 355 110 Q375 110 390 125 L360 155 Q355 150 350 150 Q345 150 340 155 L320 175 Z"
          fill="#4ade80"
        />
      </svg>
    </div>,
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse options
      ...size,
    },
  )
}
