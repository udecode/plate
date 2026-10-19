import assert from 'node:assert/strict';
import test from 'node:test';

import {
  evaluate,
  mountSampling,
  noisy,
  summarize,
} from './external-text-measurement.mjs';

test('the maintained sample count separates p95 from the largest observation', () => {
  const result = summarize(
    Array.from({ length: mountSampling.samples }, (_, index) => index + 1)
  );
  assert.equal(result.sampleCount, 30);
  assert.equal(result.p95, 29);
  assert.equal(result.max, 30);
});

test('summary preserves raw sample order and rejects missing or invalid observations', () => {
  const values = [5, 1, 3, 2, 4];
  assert.deepEqual(summarize(values), {
    p50: 3,
    p95: 5,
    min: 1,
    max: 5,
    sampleCount: 5,
    samples: values,
  });
  assert.deepEqual(values, [5, 1, 3, 2, 4]);
  for (const invalid of [[], [Number.NaN], [Infinity], [-1], new Array(3)]) {
    assert.throws(() => summarize(invalid));
  }
  assert.equal(summarize([0, 0, 0]).p95, 0);
});

test('summary keeps its own copy of the samples', () => {
  const values = [5, 1, 3];
  const result = summarize(values);

  values[0] = 99;
  assert.deepEqual(result.samples, [5, 1, 3]);
});

test('sub-millisecond frame jitter does not become a noise failure through division', () => {
  assert.equal(noisy({ p50: 0, p95: 0.4 }), false);
  assert.equal(noisy({ p50: 1, p95: 3 }), false);
  assert.equal(noisy({ p50: 10, p95: 17 }), true);
  assert.equal(noisy({ p50: 100, p95: 130 }), false);
});

test('missed absolute budgets remain non-passing without alleging broken correctness', () => {
  const result = evaluate({
    failures: [],
    budgetFailures: ['mount 154 > 150'],
    noiseFailures: [],
  });
  assert.equal(result.status, 'inconclusive');
  assert.equal(result.pass, false);
  assert.equal(result.correctnessAndValidityPass, true);
  assert.equal(result.budgetPass, false);
  assert.equal(result.exitCode, 2);
});

test('noisy runs never certify performance and invalid evidence takes precedence', () => {
  const timing = {
    failures: [],
    budgetFailures: [],
    noiseFailures: ['jitter'],
  };
  assert.equal(evaluate(timing).pass, false);
  assert.equal(evaluate(timing).exitCode, 2);
  assert.equal(
    evaluate({ ...timing, failures: ['wrong canonical text'] }).exitCode,
    1
  );
  assert.equal(
    evaluate({ failures: [], budgetFailures: [], noiseFailures: [] }).exitCode,
    0
  );
});
