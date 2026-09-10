import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const helper = path.join(scriptDir, 'create-goal-scratchpad.mjs');
const checker = path.join(scriptDir, 'check-complete.mjs');
const planPath = 'docs/plans/composed.md';

test('composition reconciles prefilled metadata and preserves adjacent template content', (t) => {
  const project = fixture(t);
  const templates = path.join(project.root, 'docs/plans/templates');
  mkdirSync(templates, { recursive: true });
  writeFileSync(path.join(templates, 'task.md'), `# {{TITLE}}

Template:
{{TEMPLATE_PATH}}

Primary template:
old-template.md

Applied packs:
- none

Objective:
Preserve this project requirement.

Work Checklist:
- [ ] Complete the project work.
`);
  for (const output of [planPath, 'docs/plans/repeated.md']) {
    const result = project.run(helper, '--template', 'task', '--with', 'docs', '--title', 'Metadata trial', '--path', output);
    assert.equal(result.status, 0, result.stderr);
    const content = readFileSync(path.join(project.root, output), 'utf8');
    assert.match(content, /Primary template:\n+docs\/plans\/templates\/task.md/);
    assert.match(content, /Applied packs:\n+- docs \(/);
    assert.equal(content.match(/^Primary template:/gm)?.length, 1);
    assert.equal(content.match(/^Applied packs:/gm)?.length, 1);
    assert.ok(content.includes('Objective:\nPreserve this project requirement.'));
    assert.ok(content.includes('- [ ] Complete the project work.'));
  }
  const before = project.read();
  const duplicate = project.run(helper, '--template', 'task', '--with', 'docs', '--title', 'Metadata trial', '--path', planPath);
  assert.notEqual(duplicate.status, 0);
  assert.equal(project.read(), before);
});

function fixture(t) {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'autogoal-composition-')));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(path.join(root, 'AGENTS.md'), '# Disposable fixture\n');
  return {
    root,
    run(script, ...args) {
      return spawnSync(process.execPath, [script, ...args], {
        cwd: root,
        encoding: 'utf8',
      });
    },
    read() {
      return readFileSync(path.join(root, planPath), 'utf8');
    },
    write(content) {
      writeFileSync(path.join(root, planPath), content);
    },
  };
}

for (const withPrimaryGates of [true, false]) {
  test(`project pack gates remain independently resolvable with ${withPrimaryGates ? 'existing tables' : 'a lightweight primary'}`, (t) => {
    const project = fixture(t);
    const templateDir = path.join(project.root, 'docs/plans/templates');
    mkdirSync(path.join(templateDir, 'packs'), { recursive: true });
    writeFileSync(
      path.join(templateDir, 'task.md'),
      `# {{TITLE}}

Objective:
Verify the composed project obligations.

Template:
{{TEMPLATE_PATH}}

Completion threshold:
Every selected obligation has evidence.

Verification surface:
The fixture completion checker.

Constraints:
Keep project-owned pack requirements.

Boundaries:
The disposable project owns this plan.

Blocked condition:
Missing pack evidence prevents completion.

${withPrimaryGates ? `Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Fixture ready | yes | fixture exists |

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Fixture proof | yes | inspect fixture | inspection passed |

` : ''}Work Checklist:
- [x] Project primary work is complete.

Verification evidence:
The primary fixture was inspected.

Open risks:
None.
`
    );
    writeFileSync(
      path.join(templateDir, 'packs/browser.md'),
      `# Project browser override

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Project route selected | pending | pending |

Work Checklist:
- [ ] Exercise the project route.
      Keep the recorded route and viewport with the result.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Project interaction proof | pending | exercise the selected route | pending |
`
    );
    const created = project.run(
      helper,
      '--template', 'task',
      '--with', 'browser,docs',
      '--with', 'browser',
      '--title', 'Composed project plan',
      '--path', planPath
    );
    assert.equal(created.status, 0, created.stderr);
    const content = project.read();
    assert.ok(content.includes('| Project route selected | pending | pending |'));
    assert.ok(content.includes('| Project interaction proof | pending | exercise the selected route | pending |'));
    assert.ok(content.includes('- [ ] Exercise the project route.\n      Keep the recorded route and viewport with the result.'));
    assert.equal(content.match(/\| Project interaction proof \|/g)?.length, 1);
    assert.ok(content.includes('- browser (docs/plans/templates/packs/browser.md)'));
    assert.ok(content.includes(`- docs (${path.relative(project.root, path.join(scriptDir, '../assets/templates/packs/docs.md'))})`));

    project.write(content.replaceAll('- [ ]', '- [x]'));
    const unresolved = project.run(checker, planPath);
    assert.equal(unresolved.status, 1);
    assert.match(unresolved.stderr, /Project route selected must resolve Applies/);
    assert.match(unresolved.stderr, /Project interaction proof must record evidence/);

    project.write(project.read().replaceAll('| pending | pending |', '| yes | observed route |')
      .replace('| Project interaction proof | pending |', '| Project interaction proof | yes |'));
    const missingEvidence = project.run(checker, planPath);
    assert.equal(missingEvidence.status, 1);
    assert.match(missingEvidence.stderr, /Project interaction proof must record evidence/);
    assert.doesNotMatch(missingEvidence.stderr, /must resolve Applies/);

    project.write(project.read().replace('| exercise the selected route | pending |', '| exercise the selected route | observed interaction |'));
    const complete = project.run(checker, planPath);
    assert.equal(complete.status, 0, complete.stderr);
  });
}

test('completion rejects unfinished obligations outside the primary checklist', (t) => {
  const project = fixture(t);
  mkdirSync(path.join(project.root, 'docs/plans'), { recursive: true });
  const content = `# Source reconciliation
Objective:
Complete the requested source and delivery proof.
Completion threshold:
Every required obligation has evidence.
Verification surface:
Recorded source and artifact checks.
Constraints:
Local proof only.
Boundaries:
The named workflow artifact.
Blocked condition:
Missing source access.
Work Checklist:
- [x] Source inspection passed.
Required checklist:
- [ ] Final artifact read-back.
  - [ ] Compare the artifact with its owning source.
Verification evidence:
Source inspection is recorded; artifact read-back remains open.
Open risks:
None beyond the open checklist.
\n\`\`\`md
- [ ] Example syntax, not a live obligation.
\`\`\`
`;
  project.write(content);
  const incomplete = project.run(checker, planPath);
  assert.notEqual(incomplete.status, 0, incomplete.stdout);
  assert.match(incomplete.stderr, /unchecked items/);
  project.write(content.replace('Final artifact read-back.', 'Final artifact read-back passed.')
    .replace('- [ ] Final', '- [x] Final')
    .replace('- [ ] Compare', '- [x] Compare')
    .replace('Source inspection is recorded; artifact read-back remains open.', 'Source inspection and final artifact read-back passed.'));
  const complete = project.run(checker, planPath);
  assert.equal(complete.status, 0, complete.stderr);
});

test('built-in checklist packs keep lightweight templates and do not seed project templates', (t) => {
  const project = fixture(t);
  const created = project.run(
    helper,
    '--template', 'task',
    '--with', 'docs',
    '--title', 'Built-in plan',
    '--path', planPath
  );
  assert.equal(created.status, 0, created.stderr);
  const content = project.read();
  assert.ok(content.includes(`Template:\n${path.relative(project.root, path.join(scriptDir, '../assets/templates/task.md'))}`));
  assert.ok(content.includes(`- docs (${path.relative(project.root, path.join(scriptDir, '../assets/templates/packs/docs.md'))})`));
  assert.doesNotMatch(content, /^(Start Gates|Completion Gates):/m);
  assert.equal(existsSync(path.join(project.root, 'docs/plans/templates')), false);
});
