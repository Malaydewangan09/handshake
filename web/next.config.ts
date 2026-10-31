import type { NextConfig } from "next";

// Pin the root so a stray lockfile higher up the tree is not picked.
const config: NextConfig = { reactStrictMode: true, outputFileTracingRoot: process.cwd() };

export default config;
