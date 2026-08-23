import withMarkdoc from "@markdoc/next.js";
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdoc"],
  turbopack: {},
};

export default withMarkdoc({
  dir: process.cwd(),
  pagesDir: path.join(process.cwd(), "pages"),
  schemaPath: "./markdoc",
} as any)(nextConfig);
