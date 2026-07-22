import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const checker = path.join(scriptRoot, 'check-complete.mjs');
const repoRoot = path.resolve(scriptRoot, '../../../..');
const plansRoot = path.join(repoRoot, 'docs/plans');

const completePlan = ({
  evidence = 'Passed with current source proof.',
  status = 'complete',
} = {}) => `Objective:
Finish the exact task.

Completion threshold:
Every named gate passes.

Verification surface:
Current source and proof artifacts.

Constraints:
No compatibility path.

Boundaries:
Only the named task.

Blocked condition:
No external blocker.

Work Checklist:
- [x] Finish implementation and proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Browser proof | yes | Run final proof | ${evidence} |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Closure | ${status} | Final proof recorded | Done |

Verification evidence:
Fresh final evidence is recorded above.

Reboot status:
Closure is complete.

Open risks:
None.
`;

const runChecker = (content) => {
  const directory = mkdtempSync(path.join(plansRoot, '.check-complete-test-'));
  const planPath = path.join(directory, 'plan.md');

  try {
    writeFileSync(planPath, content);

    return spawnSync(process.execPath, [checker, planPath], {
      cwd: repoRoot,
      encoding: 'utf8',
    });
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
};

test('accepts a fully resolved plan', () => {
  const result = runChecker(completePlan());

  assert.equal(result.status, 0, result.stderr);
});

test('rejects active phase status', () => {
  const result = runChecker(completePlan({ status: 'active' }));

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Closure=active/u);
});

for (const evidence of [
  'Not run yet; browser proof pending.',
  'Final checker run is intentionally deferred until closure.',
  'Broad repository closure remains open.',
  'Pending final implementation evidence.',
]) {
  test(`rejects unresolved gate evidence: ${evidence}`, () => {
    const result = runChecker(completePlan({ evidence }));

    assert.equal(result.status, 1);
    assert.match(result.stderr, /still records unresolved evidence/u);
  });
}
