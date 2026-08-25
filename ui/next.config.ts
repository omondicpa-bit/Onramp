import type { NextConfig } from "next";

// Static export so this can be hosted on GitHub Pages, the same way
// groupyetu360's web app is hosted — no server required.
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true, // GitHub Pages can't run Next's image optimization server
  },
  // GitHub Pages serves this at github.io/Onramp/ (not the domain root),
  // so every internal link needs that prefix — basePath handles it automatically.
  basePath: isProd ? "/Onramp" : "",
  assetPrefix: isProd ? "/Onramp/" : "",
};

export default nextConfig;
