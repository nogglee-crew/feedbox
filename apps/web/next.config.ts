import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@nogglee/feedbox"],
  // /changelog가 런타임에 리포 루트의 CHANGELOG.md를 읽는다. 번들 트레이싱에 포함시킨다
  outputFileTracingIncludes: {
    "/changelog": ["../../CHANGELOG.md", "../../packages/sdk/CHANGELOG.md"],
  },
};

export default nextConfig;
