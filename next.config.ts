import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  agentRules: false,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Photos are pre-sized to WebP (800px + 1920px) at upload time, so they are
    // served as-is. This avoids the host's image-optimisation quotas and keeps
    // the site portable between Vercel, Netlify and Cloudflare.
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  // Share-image generators read fonts and sample photos from disk at runtime.
  outputFileTracingIncludes: {
    "/**/opengraph-image*": ["./src/assets/fonts/**/*", "./public/media/samples/**/*"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
}

export default nextConfig
