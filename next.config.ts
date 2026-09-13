import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Left un-bundled so Prisma's own wasm dynamic-imports (for the D1 driver
  // adapter) survive as real files instead of being inlined/rewritten by
  // esbuild into a broken fs.readFileSync call that has nothing to read on
  // Cloudflare Workers.
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
