import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  checkSkillMirrors,
  discoverOrphanedGeneratedResources,
  discoverResourcePairs,
} from '../../.agents/rules/plate-next/scripts/sync-resources.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const source = JSON.parse(
  readFileSync(join(root, 'docs/development/pstack-source.json'), 'utf8')
);
const expected = source.skillNames;
const lock = JSON.parse(readFileSync(join(root, 'skills-lock.json'), 'utf8'));
const config = JSON.parse(
  readFileSync(join(root, '.agents/pstack.json'), 'utf8')
);
const settings = JSON.parse(
  readFileSync(join(root, '.claude/settings.json'), 'utf8')
);
const skillsRoot = join(root, '.agents/skills');
const workflowDocPath =
  /^(\.agents\/rules\/|\.agents\/playbooks\/|docs\/development\/agent-skills\.md$)/;
const markdownPath = /\.(md|mdc)$/;
const pstackScriptPath = /^\.agents\/pstack\/.+\.mjs$/;
const workflowGuidePath =
  /^docs\/(editor-behavior|research|slate-v2|slate-v2-draft)\/.+\.md$/;
const workflowGuideLink = /\]\(([^)]*agent-skills\.md)\)/g;
const names = readdirSync(skillsRoot)
  .filter((name) => existsSync(join(skillsRoot, name, 'SKILL.md')))
  .sort();
assert.equal(
  expected.length,
  25,
  'Source skill inventory must contain 25 names'
);
assert.deepEqual(
  names,
  expected,
  'Project skill names differ from the captured source'
);
assert.deepEqual(
  readdirSync(join(root, '.claude/skills')).sort(),
  expected,
  'Claude skill names differ from the captured source'
);
assert.equal(
  existsSync(join(root, '.agents/AGENTS.md')),
  false,
  'Retired instruction source remains'
);
assert.equal(
  readFileSync(join(root, 'CLAUDE.md'), 'utf8').trim(),
  '@AGENTS.md'
);
assert.deepEqual(
  checkSkillMirrors(root),
  [],
  'Generated skill text differs from local rules'
);
assert.deepEqual(
  discoverOrphanedGeneratedResources(root),
  [],
  'Orphaned generated skill resources remain'
);
for (const [from, to] of discoverResourcePairs(root)) {
  assert.deepEqual(
    readFileSync(join(root, from)),
    readFileSync(join(root, to)),
    `Resource mirror differs: ${to}`
  );
}

const ruleNames = readdirSync(join(root, '.agents/rules'))
  .filter((name) => name.endsWith('.mdc'))
  .map((name) => name.slice(0, -4))
  .sort();
assert.deepEqual(
  [...ruleNames, ...Object.keys(lock.skills)].sort(),
  expected,
  'Rule and installed skill owners differ from inventory'
);
for (const name of expected) {
  const link = join(root, '.claude/skills', name);
  assert.ok(
    lstatSync(link).isSymbolicLink(),
    `Claude skill must be a link: ${name}`
  );
  assert.equal(
    realpathSync(link),
    join(skillsRoot, name),
    `Claude link resolves outside its skill: ${name}`
  );
  const text = readFileSync(join(skillsRoot, name, 'SKILL.md'), 'utf8');
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(frontmatter, `Missing skill frontmatter: ${name}`);
  assert.equal(
    frontmatter[1].match(/^name: (.+)$/m)?.[1],
    name,
    `Incorrect skill name: ${name}`
  );
  assert.match(
    frontmatter[1],
    /^description: .+/m,
    `Missing skill description: ${name}`
  );
}

assert.equal(settings.enabledPlugins['pstack@pstack-claude'], true);
assert.equal(
  settings.extraKnownMarketplaces['pstack-claude'].source.ref,
  config.tag,
  'Plugin pin differs from project config'
);
assert.equal(config.delivery, 'pr');
assert.equal(config.branch, 'main');

const files = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard'],
  { cwd: root, encoding: 'utf8' }
)
  .trim()
  .split('\n');
for (const [path, expectedHash] of Object.entries(source.sourceFiles)) {
  const skill = path.split('/')[2];
  if (!path.startsWith('.agents/skills/') || !lock.skills[skill]) continue;
  const actualHash = createHash('sha256')
    .update(readFileSync(join(root, path)))
    .digest('hex');
  assert.equal(
    actualHash,
    expectedHash,
    `Installed skill differs from captured source: ${path}`
  );
}
const localDocs = files.filter(
  (path) =>
    existsSync(join(root, path)) &&
    workflowDocPath.test(path) &&
    markdownPath.test(path)
);
for (const path of localDocs) {
  const text = readFileSync(join(root, path), 'utf8');
  assert.doesNotMatch(
    text,
    /\b(?:plitejs|definePlugin|toReactPlugin)\b|apps\/plite\/|\.tmp\/slate-v2|registry\/bases\//,
    `Unsupported source-only method: ${path}`
  );
  const generatedPath = path
    .replace(/^\.agents\/rules\/([^/]+)\.mdc$/, '.agents/skills/$1/SKILL.md')
    .replace(/^\.agents\/rules\//, '.agents/skills/');
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (
      !target ||
      /^(?:https?:|mailto:|#)/.test(target) ||
      target.includes('<')
    )
      continue;
    assert.ok(
      existsSync(resolve(root, dirname(generatedPath), target)),
      `Dead workflow link: ${path} -> ${target}`
    );
  }
}
for (const path of files.filter(
  (path) => existsSync(join(root, path)) && workflowGuidePath.test(path)
)) {
  for (const match of readFileSync(join(root, path), 'utf8').matchAll(
    workflowGuideLink
  )) {
    assert.ok(
      existsSync(resolve(root, dirname(path), match[1])),
      `Dead workflow guide link: ${path} -> ${match[1]}`
    );
  }
}
for (const path of files.filter(
  (path) => existsSync(join(root, path)) && pstackScriptPath.test(path)
)) {
  execFileSync(process.execPath, ['--check', join(root, path)], {
    stdio: 'pipe',
  });
}
console.info(
  `Workflow exact: ${names.length} skills, ${ruleNames.length} local owners, ${Object.keys(lock.skills).length} installed owners; links, resources, pin and helper syntax pass.`
);
