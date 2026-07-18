import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath, {
    setHeaders(res, filePath) {
      // Long-lived caching for static media; hashed JS/CSS bundles are immutable
      if (/\.(?:jpe?g|png|webp|gif|svg|ico|woff2?|mp4|webm)$/i.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=2592000"); // 30 days
      } else if (/assets[\\/].+\.(?:js|css)$/i.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }));

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
