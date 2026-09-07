import type { NextConfig } from "next";
import { execSync } from "node:child_process";

// Stamped into the bundle so /debug can show which deploy a device is actually
// running. Netlify sets COMMIT_REF (Vercel: VERCEL_GIT_COMMIT_SHA); fall back
// to git for local builds.
function buildSha(): string {
  const fromEnv = process.env.COMMIT_REF ?? process.env.VERCEL_GIT_COMMIT_SHA;
  if (fromEnv) return fromEnv.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_SHA: buildSha(),
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
};

export default nextConfig;
