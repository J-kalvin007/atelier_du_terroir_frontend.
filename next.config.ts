import type { NextConfig } from "next";

const apiUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

const remotePatterns = (() => {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    {
      protocol: "http",
      hostname: "localhost",
      port: "8000",
      pathname: "/**",
    },
    {
      protocol: "http",
      hostname: "127.0.0.1",
      port: "8000",
      pathname: "/**",
    },
  ];

  if (!apiUrl) {
    return patterns;
  }

  try {
    const parsed = new URL(apiUrl);
    patterns.push({
      protocol: parsed.protocol.replace(":", "") as "http" | "https",
      hostname: parsed.hostname,
      port: parsed.port || undefined,
      pathname: "/**",
    });
  } catch {
    // Ignore invalid API URL at build time.
  }

  return patterns;
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
  async rewrites() {
    const backendBase = apiUrl.replace(/\/$/, "");

    return [
      {
        source: "/media/:path*",
        destination: `${backendBase}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
