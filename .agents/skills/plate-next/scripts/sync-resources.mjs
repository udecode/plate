#!/usr/bin/env node

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const root = resolve(dirname(scriptPath), "../../../..");
const agentRoots = ['.agents/skills', '.claude/skills'];
const resourceFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.name.startsWith('.') || entry.name === '__pycache__') return [];
      if (entry.isDirectory()) return resourceFiles(path);
      if (!entry.isFile()) throw new Error(`Unsupported skill source: ${path}`);
      return [path];
    });

export const discoverResourcePairs = (workspaceRoot) => {
  const sources = join(workspaceRoot, '.agents/rules');
  if (!existsSync(sources)) return [];
  const lockPath = join(workspaceRoot, 'skills-lock.json');
  const installed = existsSync(lockPath)
    ? JSON.parse(readFileSync(lockPath, 'utf8')).skills ?? {}
    : {};
  return readdirSync(sources)
    .filter((file) => file.endsWith('.mdc'))
    .sort()
    .flatMap((file) => {
      const name = file.slice(0, -4);
      if (name === 'next-dev-loop' || installed[name]) {
        throw new Error(`Protected installed skill has a local source: ${name}`);
      }
      const directory = join(sources, name);
      if (!existsSync(directory)) return [];
      return resourceFiles(directory).flatMap((path) => {
        const tail = path.slice(directory.length + 1);
        return agentRoots.map((agentRoot) => [
          `.agents/rules/${name}/${tail}`,
          `${agentRoot}/${name}/${tail}`,
        ]);
      });
    });
};

export const resourcePairs = discoverResourcePairs(root);
export const checkSkillMirrors = (workspaceRoot) => {
  const sources = join(workspaceRoot, '.agents/rules');
  if (!existsSync(sources)) return [];
  return readdirSync(sources)
    .filter((file) => file.endsWith('.mdc'))
    .sort()
    .flatMap((file) => {
      const name = file.slice(0, -4);
      const sourcePath = `.agents/rules/${file}`;
      const source = readFileSync(join(workspaceRoot, sourcePath), 'utf8');
      const frontmatter = source.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatter) throw new Error(`Missing skill frontmatter: ${sourcePath}`);
      const expected = `---\n${frontmatter[1]}\nname: ${name}\nmetadata:\n  skiller:\n    source: ${sourcePath}\n---${source.slice(frontmatter[0].length)}`;
      return agentRoots
        .map((agentRoot) => `${agentRoot}/${name}/SKILL.md`)
        .filter((path) => !existsSync(join(workspaceRoot, path)) ||
          readFileSync(join(workspaceRoot, path), 'utf8') !== expected);
    });
};
export const retiredGeneratedPaths = [
  ...agentRoots.flatMap((agentRoot) => [
    'major-task', 'autoclosure', 'vision', 'review-sweep', 'clawpatch',
    'resolve-slate-issue', 'promote-beta', 'sync-main-to-next',
    'potion-yjs-browser-test', 'agent-browser-issue', 'docs-creator',
    'auto', 'performance', 'testing-review',
  ].map((name) => `${agentRoot}/${name}`)),
  ...agentRoots.flatMap((agentRoot) => [
    `${agentRoot}/auto/references/quality-loop.md`,
    `${agentRoot}/task/references/engineering.md`,
    `${agentRoot}/task/references/docs.md`,
    `${agentRoot}/task/references/docs`,
    `${agentRoot}/release-lanes/references/promote.md`,
  ]),
  ".agents/skills/auto/references/regression-methodology.md",
  ".agents/skills/auto/scripts/validate-regression-ledger.mjs",
  ".agents/skills/auto/scripts/validate-regression-ledger.test.mjs",
  ".claude/skills/auto/references/regression-methodology.md",
  ".claude/skills/auto/scripts/validate-regression-ledger.mjs",
  ".claude/skills/auto/scripts/validate-regression-ledger.test.mjs",
];
export const syncResources = (workspaceRoot, { check = false } = {}) => {
  const stale = [];

  for (const [sourcePath, generatedPath] of discoverResourcePairs(workspaceRoot)) {
    const source = join(workspaceRoot, sourcePath);
    const generated = join(workspaceRoot, generatedPath);
    const matches =
      existsSync(source) &&
      existsSync(generated) &&
      readFileSync(source).equals(readFileSync(generated));

    if (matches) continue;
    if (check) {
      stale.push(generatedPath);

      continue;
    }

    mkdirSync(dirname(generated), { recursive: true });
    copyFileSync(source, generated);
  }

  for (const generatedPath of retiredGeneratedPaths) {
    const generated = join(workspaceRoot, generatedPath);

    if (!existsSync(generated)) continue;
    if (check) {
      stale.push(generatedPath);

      continue;
    }

    const skillName = generatedPath.split('/')[2];
    const lockPath = join(workspaceRoot, 'skills-lock.json');
    const installed = existsSync(lockPath)
      ? JSON.parse(readFileSync(lockPath, 'utf8')).skills ?? {}
      : {};
    if (installed[skillName]) {
      throw new Error(`Refusing to remove protected installed skill: ${skillName}`);
    }
    rmSync(generated, { recursive: true, force: true });
  }

  return stale;
};

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  const check = process.argv.slice(2).includes("--check");
  const stale = syncResources(root, { check });
  if (check) stale.push(...checkSkillMirrors(root));

  if (stale.length > 0) {
    throw new Error(`Stale generated skill resources: ${stale.join(", ")}`);
  }

  console.log(
    check
      ? "Required skill resources: exact."
      : "Required skill resources: synced."
  );
}
