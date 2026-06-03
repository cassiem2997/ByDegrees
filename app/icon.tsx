export const runtime = "edge";
export const size = {
  width: 512,
  height: 512
};
export const contentType = "image/svg+xml";

export default function Icon() {
  const svg = `
    <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ring" x1="92" y1="144" x2="420" y2="368" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#17bff5"/>
          <stop offset="0.28" stop-color="#2ee6d1"/>
          <stop offset="0.48" stop-color="#ffc400"/>
          <stop offset="0.72" stop-color="#ff7b22"/>
          <stop offset="1" stop-color="#ff2e84"/>
        </linearGradient>
        <linearGradient id="note" x1="188" y1="368" x2="342" y2="154" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#19bff5"/>
          <stop offset="0.36" stop-color="#27d5e4"/>
          <stop offset="0.52" stop-color="#ffc400"/>
          <stop offset="0.72" stop-color="#ff7928"/>
          <stop offset="1" stop-color="#ff2e84"/>
        </linearGradient>
        <filter id="softShadow" x="118" y="88" width="300" height="344" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000000" flood-opacity="0.2"/>
        </filter>
      </defs>
      <circle cx="256" cy="256" r="152" stroke="url(#ring)" stroke-width="16"/>
      <g filter="url(#softShadow)">
        <path
          d="M258 315V147C258 134.85 271.87 127.91 281.59 135.18L315.5 160.56C329.72 171.21 346.52 177.91 364.18 179.97L385.95 182.51C396.73 183.77 400.82 197.69 392.07 204.1L367.24 222.28C346.32 237.61 317.88 238.02 296.52 223.3L287 216.74V339C287 378.76 254.76 411 215 411C179.1 411 150 381.9 150 346C150 310.1 179.1 281 215 281C230.89 281 245.45 286.7 256.75 296.17C257.58 296.86 258 296.08 258 295Z"
          stroke="url(#note)"
          stroke-width="18"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="215" cy="346" r="41" fill="url(#note)"/>
        <circle cx="205" cy="337" r="10" fill="#050505"/>
        <path d="M242 225H263" stroke="#19bff5" stroke-width="8" stroke-linecap="round"/>
        <path d="M242 262H263" stroke="#19bff5" stroke-width="8" stroke-linecap="round"/>
        <path d="M242 299H263" stroke="#19bff5" stroke-width="8" stroke-linecap="round"/>
      </g>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
