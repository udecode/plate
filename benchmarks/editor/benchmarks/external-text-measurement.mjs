export const mountSampling = { warmups: 3, samples: 30 };
export const noisePolicy = { ratio: 1.6, absoluteMs: 4 };

export function summarize(values) {
  // Array.from turns holes into undefined, so sparse input fails the check.
  const samples = Array.from(values);
  if (
    !samples.length ||
    samples.some((value) => !Number.isFinite(value) || value < 0)
  ) {
    throw new Error('Timing samples must be nonempty, finite and nonnegative');
  }
  const sorted = [...samples].sort((a, b) => a - b);
  const percentile = (ratio) => sorted[Math.ceil(sorted.length * ratio) - 1];
  return {
    p50: percentile(0.5),
    p95: percentile(0.95),
    min: sorted[0],
    max: sorted.at(-1),
    sampleCount: samples.length,
    samples,
  };
}

export function noisy(row) {
  return (
    row.p95 > row.p50 * noisePolicy.ratio &&
    row.p95 - row.p50 > noisePolicy.absoluteMs
  );
}

export function evaluate({ failures, budgetFailures, noiseFailures }) {
  const status = failures.length
    ? 'invalid'
    : budgetFailures.length || noiseFailures.length
      ? 'inconclusive'
      : 'passed';
  return {
    status,
    pass: status === 'passed',
    correctnessAndValidityPass: failures.length === 0,
    budgetPass: budgetFailures.length === 0,
    noisePass: noiseFailures.length === 0,
    failures,
    budgetFailures,
    noiseFailures,
    exitCode: status === 'invalid' ? 1 : status === 'inconclusive' ? 2 : 0,
  };
}
