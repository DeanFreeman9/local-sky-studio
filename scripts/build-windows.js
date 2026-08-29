const { build, Platform } = require("electron-builder");
const fs = require("fs");
const os = require("os");
const path = require("path");

async function main() {
  const projectDir = path.resolve(__dirname, "..");
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "local-sky-build-"));
  const distDir = path.join(projectDir, "dist");
  const updateConfig = JSON.parse(
    fs.readFileSync(path.join(projectDir, "update-config.json"), "utf8"),
  );
  const publishing = process.argv.includes("--publish");

  if (publishing && (!updateConfig.enabled || !updateConfig.owner || !updateConfig.repo)) {
    throw new Error(
      "Set enabled, owner and repo in update-config.json before publishing.",
    );
  }

  const provider = {
    provider: "github",
    owner: updateConfig.owner || "configure-owner",
    repo: updateConfig.repo || "local-sky-studio",
  };

  try {
    await build({
      projectDir,
      targets: Platform.WINDOWS.createTarget(["nsis"]),
      publish: publishing ? "always" : "never",
      config: {
        directories: { output: outputDir },
        publish: [provider],
      },
    });

    fs.mkdirSync(distDir, { recursive: true });
    for (const name of fs.readdirSync(outputDir)) {
      const source = path.join(outputDir, name);
      if (fs.statSync(source).isFile()) {
        fs.copyFileSync(source, path.join(distDir, name));
        console.log(`Created dist/${name}`);
      }
    }
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
