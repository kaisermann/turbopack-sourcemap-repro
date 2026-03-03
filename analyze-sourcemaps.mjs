/**
 * Analyzes sourcemap naming in a Next.js Turbopack build output.
 *
 * Checks whether .js bundles and their .js.map files use the same base name
 * (conventional pairing) or different content hashes (Turbopack behavior).
 */

import { readFileSync } from "node:fs";
import { globSync } from "node:fs";
import path from "node:path";

const sourceMappingUrlRe = /\/\/# sourceMappingURL=(\S+\.js\.map)\s*$/;

const dirs = [
  ".next/static/chunks",
  ".next/server/chunks/ssr",
  ".next/build/chunks",
];

let totalMismatched = 0;
let totalConventional = 0;
let totalNoComment = 0;

for (const dir of dirs) {
  const jsFiles = globSync(`${dir}/**/*.js`);

  if (jsFiles.length === 0) continue;

  let mismatched = 0;
  let conventional = 0;
  let noComment = 0;
  const examples = [];

  for (const jsFile of jsFiles) {
    const content = readFileSync(jsFile, "utf-8");
    const match = sourceMappingUrlRe.exec(content);

    if (!match) {
      noComment++;
      continue;
    }

    const referencedMapName = decodeURIComponent(match[1]);
    const jsBasename = path.basename(jsFile);
    const expectedMapName = `${jsBasename}.map`;

    if (referencedMapName === expectedMapName) {
      conventional++;
    } else {
      mismatched++;
      if (examples.length < 3) {
        examples.push({
          bundle: jsBasename,
          expectedMap: expectedMapName,
          actualMap: referencedMapName,
        });
      }
    }
  }

  console.log(`\n${dir}/`);
  console.log(`  Total .js files: ${jsFiles.length}`);
  console.log(`  Conventional pairing: ${conventional}`);
  console.log(`  Mismatched hash: ${mismatched}`);
  console.log(`  No sourceMappingURL: ${noComment}`);

  if (examples.length > 0) {
    console.log(`  Examples of mismatched pairs:`);
    for (const ex of examples) {
      console.log(`    ${ex.bundle}`);
      console.log(`      expected map: ${ex.expectedMap}`);
      console.log(`      actual map:   ${ex.actualMap}`);
    }
  }

  totalMismatched += mismatched;
  totalConventional += conventional;
  totalNoComment += noComment;
}

// Also count .js.map files that have no corresponding .js file (orphans)
const allMaps = globSync(".next/**/*.js.map");
const allJs = new Set(globSync(".next/**/*.js"));

let orphanMaps = 0;
for (const mapFile of allMaps) {
  // Check both conventions: file.js.map -> file.js
  const correspondingJs = mapFile.replace(/\.map$/, "");
  if (!allJs.has(correspondingJs)) {
    orphanMaps++;
  }
}

console.log(`\n--- Summary ---`);
console.log(`Total conventional: ${totalConventional}`);
console.log(`Total mismatched: ${totalMismatched}`);
console.log(`Total no sourceMappingURL: ${totalNoComment}`);
console.log(`Orphan .map files (no same-name .js): ${orphanMaps}`);
console.log(`Total .js.map files: ${allMaps.length}`);

if (totalMismatched > 0) {
  console.log(
    `\n⚠ Turbopack uses different content hashes for .js and .js.map files.`,
  );
  console.log(
    `  Tools that rely on same-name pairing (like bugsnag-cli) will fail.`,
  );
}
