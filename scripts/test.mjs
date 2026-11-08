import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, readdirSync } from "node:fs";
mkdirSync(".test-build", { recursive: true });
writeFileSync(".test-build/package.json", JSON.stringify({ type: "commonjs" }));
function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status || 1);
}
run(process.execPath, [
  "node_modules/typescript/bin/tsc",
  "shared/game.ts",
  "lib/game-server.ts",
  "--module",
  "commonjs",
  "--target",
  "es2022",
  "--esModuleInterop",
  "--resolveJsonModule",
  "--skipLibCheck",
  "--outDir",
  ".test-build",
  "--types",
  "node",
]);
run(process.execPath, [
  "--test",
  ...readdirSync("tests")
    .filter((f) => f.endsWith(".test.cjs"))
    .map((f) => "tests/" + f),
]);
