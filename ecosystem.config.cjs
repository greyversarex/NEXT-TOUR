const fs = require("fs");
const path = require("path");

const envVars = { NODE_ENV: "production", PORT: 3000 };

const envFile = path.resolve(__dirname, ".env");
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, "utf-8").split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) return;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[key] = val;
  });
}

module.exports = {
  apps: [
    {
      name: "nexttour",
      script: "node",
      args: "dist/index.cjs",
      env: envVars,
    },
  ],
};
