/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: process.env.BRANCH === "main" ? "" : `/${process.env.BRANCH}`,
  assetPrefix: process.env.BRANCH === "main" ? "" : `/${process.env.BRANCH}/`,
};

module.exports = nextConfig;
