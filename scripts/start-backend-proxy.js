#!/usr/bin/env node

import { spawn, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_ENV_PATH = path.join(__dirname, "../backend/.env");

// Detect which .env file is being used by Shopify CLI
function detectActiveEnvFile() {
  try {
    console.log("🔍 Detecting active .env file from Shopify CLI...");

    // Run shopify app env pull to see which .env file it writes to
    // Capture stderr where Shopify CLI outputs the file path
    const output = execSync("shopify app env pull 2>&1", {
      cwd: path.join(__dirname, ".."),
      encoding: "utf8",
    });

    // Look for .env file mentions in output
    // Pattern: "No changes to .env.{name}" or "Writing to .env.{name}"
    const envMatch = output.match(/\.env[^\s,\n]*/);

    if (envMatch) {
      const envFileName = envMatch[0];
      const envPath = path.join(__dirname, "..", envFileName);

      if (fs.existsSync(envPath)) {
        console.log(`✅ Detected active .env from Shopify CLI: ${envFileName}`);
        return envPath;
      }
    }
  } catch (error) {
    console.warn("⚠️  Could not detect .env from Shopify CLI, using fallback");
  }

  // Fallback: check common locations
  const rootEnv = path.join(__dirname, "../.env");
  const files = fs.readdirSync(path.join(__dirname, ".."));
  const configFiles = files.filter(
    (f) =>
      f.startsWith("shopify.app.") &&
      f.endsWith(".toml") &&
      f !== "shopify.app.toml",
  );

  if (configFiles.length > 0) {
    const configName = configFiles[0]
      .replace("shopify.app.", "")
      .replace(".toml", "");
    const namedEnv = path.join(__dirname, `../.env.${configName}`);

    if (fs.existsSync(namedEnv)) {
      console.log(`📝 Using .env.${configName} (fallback detection)`);
      return namedEnv;
    }
  }

  if (fs.existsSync(rootEnv)) {
    console.log(`📝 Using .env (fallback detection)`);
    return rootEnv;
  }

  return null;
}

const APP_ENV_PATH = detectActiveEnvFile();

// Check if backend .env exists
if (!fs.existsSync(BACKEND_ENV_PATH)) {
  console.error("❌ Error: backend/.env file not found");
  console.error(
    "   Please create backend/.env with BACKEND_PORT and BACKEND_HOST",
  );
  process.exit(1);
}

// Read backend .env
const backendEnv = fs.readFileSync(BACKEND_ENV_PATH, "utf8");
const backendPortMatch = backendEnv.match(/BACKEND_PORT=(\d+)/);
const backendHostMatch = backendEnv.match(/BACKEND_HOST=(.+)/);

if (!backendPortMatch) {
  console.error("❌ Error: BACKEND_PORT not found in backend/.env");
  process.exit(1);
}

const backendPort = backendPortMatch[1];
const backendHost = backendHostMatch ? backendHostMatch[1].trim() : "localhost";

console.log(`📡 Starting ngrok proxy for backend...`);
console.log(`   Backend: http://${backendHost}:${backendPort}`);

// Check if ngrok is installed
const checkNgrok = spawn("which", ["ngrok"]);
checkNgrok.on("close", (code) => {
  if (code !== 0) {
    console.error("❌ Error: ngrok is not installed");
    console.error("   Install with: brew install ngrok (macOS)");
    console.error("   Or visit: https://ngrok.com/download");
    process.exit(1);
  }

  // Start ngrok
  const ngrok = spawn("ngrok", ["http", backendPort, "--log=stdout"]);

  let tunnelUrl = null;

  ngrok.stdout.on("data", (data) => {
    const output = data.toString();

    // Look for the public URL
    const urlMatch = output.match(/url=(https:\/\/[^\s]+)/);
    if (urlMatch && !tunnelUrl) {
      tunnelUrl = urlMatch[1];
      console.log(`\n✅ Ngrok tunnel started!`);
      console.log(`   Public URL: ${tunnelUrl}`);

      // Update .env file
      updateEnvFile(tunnelUrl);
    }
  });

  ngrok.stderr.on("data", (data) => {
    console.error("ngrok error:", data.toString());
  });

  ngrok.on("close", (code) => {
    console.log(`\n🛑 Ngrok tunnel closed (exit code: ${code})`);
    process.exit(code);
  });

  // Handle Ctrl+C
  process.on("SIGINT", () => {
    console.log("\n\n🛑 Stopping ngrok...");
    ngrok.kill();
    process.exit(0);
  });
});

function updateEnvFile(tunnelUrl) {
  try {
    // Check if app .env exists
    if (!APP_ENV_PATH || !fs.existsSync(APP_ENV_PATH)) {
      console.error("❌ Error: .env file not found");
      console.error("   Run: shopify app env pull");
      return;
    }

    // Read current .env
    let envContent = fs.readFileSync(APP_ENV_PATH, "utf8");
    const backendUrlLine = `BACKEND_URL=${tunnelUrl}/api`;

    // Check if BACKEND_URL exists and replace it
    if (envContent.match(/^BACKEND_URL=/m)) {
      // Update existing
      envContent = envContent.replace(/^BACKEND_URL=.*/m, backendUrlLine);
      console.log(`\n📝 Updated BACKEND_URL in ${path.basename(APP_ENV_PATH)}`);
    } else {
      // Append new
      envContent += `\n${backendUrlLine}\n`;
      console.log(`\n📝 Added BACKEND_URL to ${path.basename(APP_ENV_PATH)}`);
    }

    // Write back
    fs.writeFileSync(APP_ENV_PATH, envContent);

    console.log(`\n✨ Configuration complete!`);
    console.log(`   BACKEND_URL=${tunnelUrl}/api`);
    console.log(`\n💡 Backend is now accessible via HTTPS:`);
    console.log(`   ${tunnelUrl}/api/campaigns/checkout`);
    console.log(
      `\n⚠️  Important: Restart your Shopify app dev server to load the new .env`,
    );
  } catch (error) {
    console.error("❌ Error updating .env:", error.message);
  }
}
