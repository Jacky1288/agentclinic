import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 让原生/数据库依赖走 Node 外部依赖，不被 Turbopack 深度打包编译
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
};

export default nextConfig;
