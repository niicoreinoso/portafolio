import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Oculta el indicador de desarrollo de Next.js (el ícono "N" abajo a la izquierda)
  devIndicators: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com" }],
  },
};

export default nextConfig;
