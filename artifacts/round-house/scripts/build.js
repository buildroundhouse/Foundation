const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const webOut = path.join(projectRoot, "static-build", "web");

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: { ...process.env, NODE_ENV: "production" },
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

function injectPwaMetaTags() {
  const indexHtmlPath = path.join(webOut, "index.html");
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error(`Web export did not create ${indexHtmlPath}`);
  }

  let html = fs.readFileSync(indexHtmlPath, "utf8");
  html = html.replace(
    '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />',
  );

  if (!html.includes('rel="manifest"')) {
    const tags = `
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="Roundhouse" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="theme-color" content="#000000" />
    <meta property="og:title" content="Roundhouse" />
    <meta property="og:description" content="A shared timeline for the work that happens around a property." />
    <meta property="og:image" content="/icon-512.png" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Roundhouse" />
    <meta name="twitter:image" content="/icon-512.png" />`;
    html = html.replace("</head>", `${tags}\n  </head>`);
  }

  fs.writeFileSync(indexHtmlPath, html);
}

async function main() {
  fs.rmSync(path.join(projectRoot, "static-build"), {
    recursive: true,
    force: true,
  });
  await run("pnpm", [
    "exec",
    "expo",
    "export",
    "--platform",
    "web",
    "--output-dir",
    webOut,
    "--clear",
  ]);
  injectPwaMetaTags();
  console.log(`Web build ready at ${webOut}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
