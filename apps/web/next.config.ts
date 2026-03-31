import "@route-pulse/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: ["react-map-gl", "mapbox-gl", "@vis.gl/react-mapbox"],
  serverExternalPackages: ["@prisma/client", "@route-pulse/db"],
  images: {
    remotePatterns: [
      // Cloudflare R2 — custom public CDN domain
      {
        protocol: "https",
        hostname: "imgroutepulse.devnexis.in",
        pathname: "/**",
      },
      // Cloudflare R2 — raw r2.dev fallback
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
      // Gravatar — default profile pictures
      {
        protocol: "https",
        hostname: "www.gravatar.com",
        pathname: "/avatar/**",
      },
      // Pravatar — driver avatar placeholders used in route cards
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
