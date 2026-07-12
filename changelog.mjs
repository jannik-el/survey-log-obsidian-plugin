// Changelog tooling for the release pipeline.
//
//   node changelog.mjs release          Promote [Unreleased] to the version in
//                                        $npm_package_version (stamped with today's
//                                        date), open a fresh [Unreleased], and
//                                        regenerate the compare-links. No-op when
//                                        [Unreleased] has no entries.
//
//   node changelog.mjs extract <ver>     Print the notes for <ver> to stdout
//                                        (used as the GitHub release body). Prints
//                                        nothing and exits 0 when the section is
//                                        absent or empty.
//
// Run automatically by the `version` npm script (release) and by the release
// workflow (extract). Format: https://keepachangelog.com/en/1.1.0/

import { readFileSync, writeFileSync } from "fs";

const REPO = "https://github.com/jannik-el/survey-log-obsidian-plugin";
const FILE = "CHANGELOG.md";

/** Body of a `## [heading]` section: text up to the next `## [` or the link block. */
function sectionBody(text, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`## \\[${escaped}\\][^\\n]*\\n([\\s\\S]*?)(?=\\n## \\[|\\n\\[[^\\]]+\\]:\\s+https?:)`);
  const match = re.exec(text);
  return match ? match[1].trim() : null;
}

/** A section counts as "real" only when it has at least one list item. */
function hasEntries(body) {
  return body !== null && /^\s*[-*]\s+\S/m.test(body);
}

/** Rebuild the reference-link block at the bottom from the versions present. */
function withRegeneratedLinks(text) {
  const versions = [...text.matchAll(/^## \[(\d+\.\d+\.\d+)\]/gm)].map((m) => m[1]);
  const refs = [`[Unreleased]: ${REPO}/compare/${versions[0]}...HEAD`];
  versions.forEach((v, i) => {
    const older = versions[i + 1];
    refs.push(
      older ? `[${v}]: ${REPO}/compare/${older}...${v}` : `[${v}]: ${REPO}/releases/tag/${v}`
    );
  });
  const body = text
    .split("\n")
    .filter((line) => !/^\[[^\]]+\]:\s+https?:\/\//.test(line))
    .join("\n")
    .replace(/\n+$/, "");
  return `${body}\n\n${refs.join("\n")}\n`;
}

function release() {
  const version = process.env.npm_package_version;
  if (!version) {
    console.error("changelog: npm_package_version is not set; skipping.");
    return;
  }
  const text = readFileSync(FILE, "utf8");
  if (!hasEntries(sectionBody(text, "Unreleased"))) {
    console.log(`changelog: [Unreleased] is empty; no ${version} section added.`);
    return;
  }
  const date = new Date().toISOString().slice(0, 10);
  const promoted = text.replace(
    /## \[Unreleased\][^\n]*\n/,
    `## [Unreleased]\n\n## [${version}] - ${date}\n`
  );
  writeFileSync(FILE, withRegeneratedLinks(promoted));
  console.log(`changelog: released ${version} (${date}).`);
}

function extract(version) {
  if (!version) {
    console.error("changelog: extract needs a version argument.");
    process.exit(1);
  }
  const body = sectionBody(readFileSync(FILE, "utf8"), version);
  if (body) process.stdout.write(`${body}\n`);
}

const [command, arg] = process.argv.slice(2);
if (command === "release") release();
else if (command === "extract") extract(arg);
else {
  console.error("Usage: node changelog.mjs <release | extract <version>>");
  process.exit(1);
}
