#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { grepFiles } from './private-files.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
const NOTICES = 'THIRD_PARTY_NOTICES.md';
const CREDIT =
  /\b(?:adapted|copied|derived|ported|vendored) from\s+([@\w][\w./@-]*)/iu;
const LICENSE = /\b(?:MIT|Apache|BSD|ISC|MPL)\b|\blicen[cs]e\b/iu;
const COMMENT = /^\s*(?:\/\/|\/\*|\*)/u;

const creditsOf = (file) => {
  const lines = readFileSync(join(root, file), 'utf-8').split('\n');
  return lines.flatMap((line, index) => {
    const credit = COMMENT.test(line) && CREDIT.exec(line);
    if (!credit) return [];
    let end = index + 1;
    while (end < lines.length && COMMENT.test(lines[end])) end += 1;
    if (!LICENSE.test(lines.slice(index, end).join(' '))) return [];
    const project = credit[1].replace(/(?:'s|[.,;:])+$/u, '');
    return [{ file, line: index + 1, project }];
  });
};

const files = grepFiles(
  root,
  ['-l', '-i', '-E', '(adapted|copied|derived|ported|vendored) from'],
  [':(glob)packages/*/src/**']
)
  .split('\n')
  .filter(Boolean);

const problems = [];
const byPackage = Map.groupBy(files.flatMap(creditsOf), ({ file }) =>
  file.split('/').slice(0, 2).join('/')
);

for (const [pkg, credits] of byPackage) {
  const noticesPath = `${pkg}/${NOTICES}`;
  const notices = existsSync(join(root, noticesPath))
    ? readFileSync(join(root, noticesPath), 'utf-8')
    : '';
  const listed = new Set(
    [...notices.matchAll(/^## (.+)$/gmu)].map(([, name]) =>
      name.trim().toLowerCase()
    )
  );
  for (const { file, line, project } of credits) {
    if (listed.has(project.toLowerCase())) continue;
    problems.push(
      `${file}:${line} credits code adapted from ${project}, and ${noticesPath} has no "## ${project}" section. Add one that names the adapted files and holds ${project}'s copyright and license text.`
    );
  }
  const { files: packed = [] } = JSON.parse(
    readFileSync(join(root, pkg, 'package.json'), 'utf-8')
  );
  if (!packed.includes(NOTICES)) {
    problems.push(
      `${pkg}/package.json does not list ${NOTICES} in "files", so the published package drops the notices its adapted code needs. Add it.`
    );
  }
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(
  `third-party-notices: ${byPackage.size} package(s) list every project their source credits.`
);
