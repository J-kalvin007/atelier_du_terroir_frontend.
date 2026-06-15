import type { NextConfig } from "next";

const remotePatterns = (() => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return [];
  }

  try {
    const parsed = new URL(apiUrl);
    return [
      {
        protocol: parsed.protocol.replace(":", "") as "http" | "https",
        hostname: parsed.hostname,
        port: parsed.port,
        pathname: "/**",
      },
    ];
  } catch {
    return [];
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
