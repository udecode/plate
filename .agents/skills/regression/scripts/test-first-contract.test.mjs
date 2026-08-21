import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const frontmatterPattern = /^---\n([\s\S]*?)\n---/;

const expectedGeneratedSkill = ({ name, sourcePath }) => {
  const source = read(sourcePath);
  const frontmatter = source.match(frontmatterPattern);

  assert.ok(frontmatter);

  return `---\n${frontmatter[1]}\nname: ${name}\nmetadata:\n  skiller:\n    source: ${sourcePath}\n---${source.slice(frontmatter[0].length)}`;
};

test('Regression makes executable tests the durable behavior authority', () => {
  const rule = read('.agents/rules/regression.mdc');
  const methodology = read(
    '.agents/rules/regression/references/methodology.md'
  );

  assert.match(rule, /Executable tests own durable regression behavior/);
  assert.match(
    methodology,
    /Every observed regression needs a permanent executable test/
  );
  assert.match(methodology, /The goal plan is transient execution state/);
});

test('Regression corpus work derives coordination from executable sources', () => {
  const methodology = read(
    '.agents/rules/regression/references/methodology.md'
  );
  const template = read('docs/plans/templates/regression.md');

  assert.match(
    methodology,
    /Discover the current corpus from executable sources each run/
  );
  assert.match(template, /Selected executable cases:/);
  assert.match(template, /Executable regression coverage/);
  assert.match(template, /No duplicate registry/);
});

test('Regression completes fully proved local work without requiring a push', () => {
  const rule = read('.agents/rules/regression.mdc');
  const methodology = read(
    '.agents/rules/regression/references/methodology.md'
  );
  const template = read('docs/plans/templates/regression.md');

  assert.match(rule, /Commit and push are not local completion gates/);
  assert.match(
    methodology,
    /A Regression run is `completed`[\s\S]*Commit and push are not\s+local completion gates/
  );
  assert.match(template, /Local completion status/);
  assert.match(
    template,
    /Do not widen that\s+status into integrated, shipped, released, or public issue completion/
  );
  assert.doesNotMatch(
    rule,
    /Never call a run fixed, shipped, completed, or clean beyond/
  );
});

test('Patch receives an executable red case instead of duplicate state', () => {
  const patchRule = read('.agents/rules/patch.mdc');

  assert.match(patchRule, /normalized executable case packet/);
  assert.match(patchRule, /exact test file and red result/);
  assert.match(
    patchRule,
    /return the executable test path and command, exact red\s+and green results/
  );
});

test('failed claimed fixes interrupt Patch and automatically repair Regression', () => {
  const regressionRule = read('.agents/rules/regression.mdc');
  const patchRule = read('.agents/rules/patch.mdc');
  const methodology = read(
    '.agents/rules/regression/references/methodology.md'
  );

  assert.match(
    regressionRule,
    /Every failed claimed bug fix automatically repairs Regression/
  );
  assert.match(
    regressionRule,
    /regression repair <case-id>: <missed invariant or proof failure>/
  );
  assert.match(patchRule, /automatically route\s+`regression repair/);
  assert.match(methodology, /A failed fix always records\s+`repair-now`/);
  assert.match(methodology, /On attempt 2[\s\S]*run `best-api`/);
});

test('Regression routes semantic completion through executable helpers', () => {
  const rule = read('.agents/rules/regression.mdc');
  const template = read('docs/plans/templates/regression.md');

  assert.match(rule, /validate-regression-plan\.mjs/);
  assert.match(rule, /capture-proof-receipt\.mjs/);
  assert.match(template, /Reporter oracle matrix:/);
  assert.match(template, /Failed fix history:/);
  assert.match(template, /Architecture pressure:/);
  assert.match(template, /Proof receipts:/);
  assert.match(template, /Affected corpus replay:/);
  assert.match(template, /Regression semantic plan/);
});

test('generated Regression and Patch skills match their source rules', () => {
  assert.equal(
    read('.agents/skills/regression/SKILL.md'),
    expectedGeneratedSkill({
      name: 'regression',
      sourcePath: '.agents/rules/regression.mdc',
    })
  );
  assert.equal(
    read('.agents/skills/patch/SKILL.md'),
    expectedGeneratedSkill({
      name: 'patch',
      sourcePath: '.agents/rules/patch.mdc',
    })
  );
});
