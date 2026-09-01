import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { createDOMPhaseScheduler } from '../../../../../packages/plitejs/src/dom/plugin/dom-phase-scheduler.ts';
import { summarize, writeBenchmarkArtifact } from '../../shared/stats.mjs';

const measuredFiles = [
  'packages/plitejs/src/dom/plugin/dom-phase-scheduler.ts',
  'benchmarks/slate-v2/donor/core/current/dom-phase-scheduler.mjs',
];
const fingerprint = () => Object.fromEntries(measuredFiles.map((file) => [
  file, createHash('sha256').update(readFileSync(file)).digest('hex'),
]));
const before = fingerprint();
const rows = [];
const phases = ['model', 'dom-read', 'dom-write', 'selection-repair'];

for (const count of [100, 1000, 10_000, 50_000]) {
  for (const action of ['flush', 'cancel', 'replace-key']) {
    const samples = [];
    let executedTasks = 0;
    let scheduledFrames = 0;
    for (let sample = 0; sample < 22; sample++) {
      let calls = 0;
      let lastPhase = 0;
      let frameRequests = 0;
      let frameCancellations = 0;
      const scheduler = createDOMPhaseScheduler({
        getWindow: () => ({
          requestAnimationFrame: () => ++frameRequests,
          cancelAnimationFrame: () => frameCancellations++,
          queueMicrotask() {},
          setTimeout: () => 1,
          clearTimeout() {},
        }),
      });
      const cancels = [];
      for (let index = 0; index < count; index++) {
        const phase = index % phases.length;
        cancels.push(scheduler.schedule(phases[phase], `task-${index}`, () => {
          assert.ok(phase >= lastPhase, 'Phase ordering changed');
          lastPhase = phase;
          calls++;
        }, { key: `task-${index}` }));
      }
      const start = performance.now();
      if (action === 'flush') scheduler.flush();
      else if (action === 'cancel') {
        for (const cancel of cancels) cancel();
      } else {
        for (let index = 0; index < count; index++) {
          scheduler.schedule('dom-write', 'replacement', () => calls++, { key: `task-${index}` });
        }
      }
      const duration = performance.now() - start;
      if (sample >= 2) samples.push(duration);
      if (action === 'replace-key') {
        assert.equal(scheduler.pending(), count);
        scheduler.flush();
      }
      assert.equal(calls, action === 'cancel' ? 0 : count);
      assert.equal(scheduler.pending(), 0);
      assert.equal(frameRequests, 1);
      scheduler.destroy();
      assert.equal(frameCancellations, 1);
      executedTasks = calls;
      scheduledFrames = frameRequests;
    }
    const timing = summarize(samples);
    const budgetMs = count <= 10_000 ? 16.67 : 100;
    rows.push({ action, count, budgetMs, counters: { executedTasks, scheduledFrames }, timing, pass: timing.p95 <= budgetMs });
  }
}

const after = fingerprint();
assert.deepEqual(after, before, 'Measured scheduler source changed during the benchmark');
const failures = rows.filter((row) => !row.pass).length;
await writeBenchmarkArtifact('tmp/plite-dom-phase-scheduler-benchmark.json', {
  benchmark: 'dom-phase-scheduler',
  rows,
  sourceIdentity: { measuredInputs: after },
  summary: { failures, worstP95Ms: Math.max(...rows.map((row) => row.timing.p95)) },
});
console.log(`METRIC plite_dom_phase_scheduler_guard_failures=${failures}`);
console.log('ARTIFACT tmp/plite-dom-phase-scheduler-benchmark.json');
if (process.env.PLITE_DOM_PHASE_SCHEDULER_STRICT === '1' && failures > 0) {
  throw new Error(`DOM phase scheduler missed ${failures} queue budgets`);
}
