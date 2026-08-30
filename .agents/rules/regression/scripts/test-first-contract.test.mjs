import assert from 'node:assert/strict';
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
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

test('an exact unit RED stops new E2E test escalation', () => {
  const rule = read('.agents/rules/regression.mdc');
  const methodology = read(
    '.agents/rules/regression/references/methodology.md'
  );
  const template = read('docs/plans/templates/regression.md');

  assert.match(
    rule,
    /When an exact owner-level unit or\s+package test is RED[\s\S]*Do not add a new E2E\s+test/
  );
  assert.match(
    methodology,
    /E2E is the fallback regression layer[\s\S]*cannot be reproduced RED in an owner-level unit or package test/
  );
  assert.match(template, /Red-test escalation/);
  assert.match(template, /`unit-red:`[\s\S]*`e2e-required:`/);
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

test('reporter follow-ups extend a cumulative phase-aware oracle', () => {
  const regressionRule = read('.agents/rules/regression.mdc');
  const methodology = read(
    '.agents/rules/regression/references/methodology.md'
  );
  const template = read('docs/plans/templates/regression.md');

  assert.match(
    regressionRule,
    /later reply is a\s+delta, not a replacement oracle[\s\S]*still-applicable claim[\s\S]*interaction\s+phase/
  );
  assert.match(
    methodology,
    /Cumulative Reporter Evidence[\s\S]*original report[\s\S]*Reporter follow-ups are deltas[\s\S]*during-action/
  );
  assert.match(template, /Reporter evidence inventory:/);
  assert.match(
    template,
    /Every required evidence row maps to a phase-specific executable oracle/
  );
  assert.match(template, /\| Case ID \| Observation \| Phase \| Applies \|/);
});

test('reporter rerender claims require a route-wide repeated-component oracle', () => {
  const regressionRule = read('.agents/rules/regression.mdc');
  const methodology = read(
    '.agents/rules/regression/references/methodology.md'
  );

  assert.match(
    regressionRule,
    /reporter names rerendering[\s\S]*exact-route, phase-specific repeated-component inventory[\s\S]*wrapper-local Profiler[\s\S]*every family above 5%[\s\S]*at least 90%/
  );
  assert.match(
    methodology,
    /reporter-visible rerender[\s\S]*exact-route, phase-specific component[\s\S]*wrapper-local Profiler[\s\S]*every family above 5%[\s\S]*at least 90%/
  );
});

test('plain reporter UI nouns require a complete visible-affordance inventory', () => {
  const regressionRule = read('.agents/rules/regression.mdc');
  const methodology = read(
    '.agents/rules/regression/references/methodology.md'
  );
  const template = read('docs/plans/templates/regression.md');

  assert.match(
    regressionRule,
    /plain UI noun[\s\S]*reporter-noun:[\s\S]*affordance-inventory:[\s\S]*uninventoried matching affordance/
  );
  assert.match(
    methodology,
    /Plain UI nouns describe the visible job[\s\S]*source and exact\s+route[\s\S]*accepted-product authority/
  );
  assert.match(
    template,
    /pointer-feedback` positive assertion[\s\S]*reporter-noun:[\s\S]*affordance-inventory:/
  );
});

test('stability-only failures freeze product edits until proof drift is classified', () => {
  const regressionRule = read('.agents/rules/regression.mdc');
  const methodology = read(
    '.agents/rules/regression/references/methodology.md'
  );
  const template = read('docs/plans/templates/regression.md');

  assert.match(
    regressionRule,
    /failure appears only during stability[\s\S]*freeze product bytes/
  );
  assert.match(
    methodology,
    /programmatic shortcut[\s\S]*shared browser harness/
  );
  assert.match(template, /stability-only failure[\s\S]*froze product edits/);
});

test('responsive geometry proof waits for bounded layout convergence', () => {
  const regressionRule = read('.agents/rules/regression.mdc');
  const methodology = read(
    '.agents/rules/regression/references/methodology.md'
  );
  const template = read('docs/plans/templates/regression.md');

  assert.match(
    regressionRule,
    /animation frame[\s\S]*bounded convergence poll[\s\S]*immediate bounding[\s\S]*invalid proof[\s\S]*pre-convergence[\s\S]*converged geometry/
  );
  assert.match(
    methodology,
    /Responsive geometry[\s\S]*bounded timeout[\s\S]*immediate bounding-box read[\s\S]*invalid[\s\S]*pre-convergence and converged geometry/
  );
  assert.match(
    template,
    /Responsive geometry proof[\s\S]*bounded invariant poll[\s\S]*pre-convergence and converged geometry/
  );
});

test('exact Chrome proof attests the launched executable and separates proof-host failures', () => {
  const regressionRule = read('.agents/rules/regression.mdc');
  const methodology = read(
    '.agents/rules/regression/references/methodology.md'
  );
  const capture = join(
    root,
    '.agents/rules/regression/scripts/capture-proof-receipt.mjs'
  );
  const fixtureDir = mkdtempSync(join(tmpdir(), 'regression-chrome-'));
  const fakeChrome = join(fixtureDir, 'chrome');

  writeFileSync(fakeChrome, '#!/bin/sh\nprintf "Google Chrome 999.0\\n"\n');
  chmodSync(fakeChrome, 0o755);

  try {
    const missingExecutable = spawnSync(
      process.execPath,
      [
        capture,
        '--case-id',
        'chrome-case',
        '--attempt',
        '1',
        '--claim',
        'completed',
        '--input',
        '.agents/rules/regression/scripts/test-first-contract.test.mjs',
        '--host-pid',
        String(process.pid),
        '--base-url',
        'http://localhost:1',
        '--browser',
        'exact-chrome:test',
        '--retries',
        '0',
        '--',
        process.execPath,
        '-e',
        'process.exit(0)',
      ],
      { cwd: root, encoding: 'utf8' }
    );

    assert.equal(missingExecutable.status, 1);
    assert.match(
      missingExecutable.stderr,
      /exact Chrome proof requires --browser-executable/
    );

    const attested = spawnSync(
      process.execPath,
      [
        capture,
        '--case-id',
        'chrome-case',
        '--attempt',
        '1',
        '--claim',
        'completed',
        '--input',
        '.agents/rules/regression/scripts/test-first-contract.test.mjs',
        '--host-pid',
        String(process.pid),
        '--base-url',
        'http://localhost:1',
        '--browser',
        'exact-chrome:test',
        '--browser-executable',
        fakeChrome,
        '--retries',
        '0',
        '--',
        process.execPath,
        '-e',
        'process.exit(0)',
        fakeChrome,
      ],
      { cwd: root, encoding: 'utf8' }
    );

    assert.equal(attested.status, 0, attested.stderr);
    assert.match(attested.stdout, /browser:exact-chrome:test/);
    assert.match(attested.stdout, /browser-executable:/);
    assert.match(attested.stdout, /browser-version:Google Chrome 999\.0/);
    assert.match(
      regressionRule,
      /pre-assertion proof-host failure[\s\S]*cannot fabricate a product failure/
    );
    assert.match(
      methodology,
      /Confirm one[\s\S]*worker launch trace before counting stability/
    );
  } finally {
    rmSync(fixtureDir, { force: true, recursive: true });
  }
});

test('stability counts fresh executions instead of cached proof reuse', () => {
  const regressionRule = read('.agents/rules/regression.mdc');

  assert.match(
    regressionRule,
    /Each required stability repetition must execute the proof command[\s\S]*Cached result\s+reuse does not count/
  );
});

test('compositor repairs require material-state traces and pixel proof', () => {
  const regressionRule = read('.agents/rules/regression.mdc');
  const methodology = read(
    '.agents/rules/regression/references/methodology.md'
  );
  const template = read('docs/plans/templates/regression.md');

  assert.match(
    regressionRule,
    /trace[\s\S]*computed style[\s\S]*live\s+range geometry[\s\S]*model\/DOM endpoints[\s\S]*callback identity/
  );
  assert.match(
    methodology,
    /already final[\s\S]*reject lifecycle ordering as the cause/
  );
  assert.match(
    template,
    /computed style[\s\S]*live range geometry[\s\S]*model\/DOM endpoints[\s\S]*callback identity[\s\S]*pixels stay red[\s\S]*timing is rejected/
  );
});

test('blocking pixel classifiers reject absent and duplicate layers', () => {
  const regressionRule = read('.agents/rules/regression.mdc');
  const methodology = read(
    '.agents/rules/regression/references/methodology.md'
  );
  const template = read('docs/plans/templates/regression.md');
  const patchRule = read('.agents/rules/patch.mdc');
  const browserPack = read('docs/plans/templates/packs/browser.md');

  assert.match(
    regressionRule,
    /pixel-diff oracle[\s\S]*known-correct single-layer state[\s\S]*known-absent state[\s\S]*known-invalid duplicate-layer state[\s\S]*Width or outer geometry alone cannot certify[\s\S]*layer count[\s\S]*invalidates every result/
  );
  assert.match(
    methodology,
    /known-correct single-layer state[\s\S]*known-absent state[\s\S]*known-invalid duplicate-layer state[\s\S]*Width[\s\S]*or outer geometry alone cannot certify[\s\S]*layer count[\s\S]*revoke[\s\S]*every green or red/
  );
  assert.match(
    template,
    /blocking pixel classifier[\s\S]*known-correct single-layer[\s\S]*known-absent[\s\S]*known-invalid duplicate-layer[\s\S]*width or outer geometry alone cannot certify layer count[\s\S]*freezes product edits/i
  );
  assert.match(
    regressionRule,
    /geometry-paint[\s\S]*actual pixel capture[\s\S]*positive-control: pass[\s\S]*negative-control: pass[\s\S]*duplicate-control: pass[\s\S]*Computed[\s\S]*style[\s\S]*diagnostics only/
  );
  assert.match(
    methodology,
    /geometry-paint[\s\S]*actual pixel capture[\s\S]*positive-control: pass[\s\S]*negative-control: pass[\s\S]*duplicate-control: pass[\s\S]*Computed style[\s\S]*cannot close/
  );
  assert.match(
    patchRule,
    /reporter-visible paint claim[\s\S]*classify actual pixels[\s\S]*known-correct single-layer[\s\S]*known-absent[\s\S]*known-invalid[\s\S]*duplicate-layer controls[\s\S]*needs-repro/
  );
  assert.match(
    browserPack,
    /reporter-visible paint claim[\s\S]*classified[\s\S]*known-correct[\s\S]*single-layer[\s\S]*known-absent[\s\S]*known-invalid duplicate-layer[\s\S]*positive-control: pass[\s\S]*negative-control: pass[\s\S]*duplicate-control: pass[\s\S]*Computed style[\s\S]*not final paint proof/
  );
});

test('shared style changes inventory explicit paint neutralizers', () => {
  const regressionRule = read('.agents/rules/regression.mdc');
  const methodology = read(
    '.agents/rules/regression/references/methodology.md'
  );
  const template = read('docs/plans/templates/regression.md');

  assert.match(
    regressionRule,
    /shared CSS selector, marker, class map, or style expansion[\s\S]*every current consumer[\s\S]*neutralize or override[\s\S]*duplicate or inherited\s+paint/
  );
  assert.match(
    methodology,
    /shared CSS selector, marker, class map, or style expansion[\s\S]*transparent, borderless, shadowless, and ringless wrappers[\s\S]*positive oracle[\s\S]*cannot authorize/
  );
  assert.match(
    template,
    /shared CSS selector, marker, class map, or style expansion[\s\S]*transparent, borderless, shadowless, and ringless overrides[\s\S]*duplicate\/inherited-paint geometry oracle/
  );
  assert.match(template, /Shared-style consumer closure/);
});

test('Regression routes semantic completion through executable helpers', () => {
  const rule = read('.agents/rules/regression.mdc');
  const template = read('docs/plans/templates/regression.md');

  assert.match(rule, /validate-regression-plan\.mjs/);
  assert.match(rule, /capture-proof-receipt\.mjs/);
  assert.match(template, /Reporter evidence inventory:/);
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
