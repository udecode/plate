import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const noRegression = Object.freeze({
  latency: Object.freeze({ absoluteMs: 5, relative: 0.1 }),
  minPairs: 3,
  profile: Object.freeze({
    maxProgramShare: 0.8,
    maxRatio: 1.2,
    minRatio: 0.8,
  }),
});

export const policies = Object.freeze({
  's5-no-regression-v1': Object.freeze({
    ...noRegression,
    checks: Object.freeze([
      'completeness',
      'latency',
      'correctness',
      'attribution',
    ]),
    id: 's5-no-regression-v1',
  }),
  's5-work-gain-profile120-v1': Object.freeze({
    ...noRegression,
    checks: Object.freeze([
      'completeness',
      'latency',
      'correctness',
      'attribution',
      'work',
    ]),
    id: 's5-work-gain-profile120-v1',
    work: Object.freeze({ minGainMs: 100, minGainRatio: 0.2 }),
  }),
});

const arms = Object.freeze(['baseline', 'candidate']);
const profileShares = Object.freeze([
  'gc',
  'other',
  'parse',
  'program',
  'react',
  'transaction',
]);

const isDuration = (value) => Number.isFinite(value) && value >= 0;

const median = (values) => {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};

const check = (reasons, values = {}) => ({
  reasons: reasons.map(([, reason]) => reason),
  status: reasons.some(([status]) => status === 'fail')
    ? 'fail'
    : reasons.length > 0
      ? 'inconclusive'
      : 'pass',
  values,
});

function measuredStreams(receipt, policy) {
  const pairs = receipt.pairs ?? policy.minPairs;
  const roles = Array.from({ length: pairs }, (_, index) => `pair-${index}`);

  return {
    pairs,
    roles,
    streams: receipt.streams.filter((stream) => stream.role !== 'warmup'),
  };
}

function assessCompleteness(receipt, policy) {
  const reasons = [];
  const { pairs, roles, streams } = measuredStreams(receipt, policy);

  if (receipt.status !== 'complete') {
    reasons.push(['inconclusive', `status ${receipt.status}`]);
  }
  if (!Number.isInteger(pairs) || pairs < policy.minPairs) {
    reasons.push(['inconclusive', `pairs ${pairs} below ${policy.minPairs}`]);
  }
  for (const role of roles) {
    for (const arm of arms) {
      const count = streams.filter(
        (stream) => stream.role === role && stream.arm === arm
      ).length;

      if (count === 0) reasons.push(['inconclusive', `missing ${arm} ${role}`]);
      if (count > 1) reasons.push(['fail', `duplicate ${arm} ${role}`]);
    }
  }
  for (const stream of streams) {
    if (!roles.includes(stream.role) || !arms.includes(stream.arm)) {
      reasons.push(['fail', `unscheduled ${stream.arm} ${stream.role}`]);
    }
    if (stream.timedOut) {
      reasons.push(['fail', `${stream.arm} ${stream.role} timed out`]);
    }
    if (stream.errors?.length) {
      reasons.push(['fail', `${stream.arm} ${stream.role} recorded errors`]);
    }
  }
  roles.forEach((role, index) => {
    const pair = streams.filter((stream) => stream.role === role);
    const [first] = pair.sort((left, right) => left.order - right.order);
    const expected = index % 2 === 0 ? 'baseline' : 'candidate';

    if (pair.length !== arms.length) return;
    if (!pair.every((stream) => isDuration(stream.order))) {
      reasons.push(['inconclusive', `${role} has no order`]);
    } else if (first.arm !== expected) {
      reasons.push([
        'fail',
        `${role} starts with ${first.arm}, expected ${expected}`,
      ]);
    }
  });

  return check(reasons, { pairs });
}

function armValues(streams, read) {
  return Object.fromEntries(
    arms.map((arm) => [
      arm,
      streams.filter((stream) => stream.arm === arm).map(read),
    ])
  );
}

function assessLatency(receipt, policy) {
  const reasons = [];
  const { streams } = measuredStreams(receipt, policy);
  const finals = armValues(streams, (stream) => stream.trace?.finalWorkMs);
  const arrivals = armValues(streams, (stream) => stream.page?.latencyP95Ms);

  for (const [name, values] of Object.entries({
    final: finals,
    arrival: arrivals,
  })) {
    for (const arm of arms) {
      if (values[arm].length === 0 || !values[arm].every(isDuration)) {
        reasons.push([
          'inconclusive',
          `${arm} ${name} clock missing or invalid`,
        ]);
      }
    }
  }
  if (reasons.length > 0) return check(reasons);

  const final = Object.fromEntries(
    arms.map((arm) => [arm, Math.max(...finals[arm])])
  );
  const arrival = Object.fromEntries(
    arms.map((arm) => [arm, median(arrivals[arm])])
  );
  const allowed = (baseline) =>
    Math.max(baseline * policy.latency.relative, policy.latency.absoluteMs);

  if (final.candidate > final.baseline + allowed(final.baseline)) {
    reasons.push(['fail', 'final latency regressed']);
  }
  if (arrival.candidate > arrival.baseline + allowed(arrival.baseline)) {
    reasons.push(['fail', 'arrival latency regressed']);
  }

  return check(reasons, { arrivalP95Ms: arrival, finalMs: final });
}

function assessCorrectness(receipt, policy) {
  const reasons = [];
  const { streams } = measuredStreams(receipt, policy);
  const { preflight } = receipt;
  const hashes = new Set(streams.map((stream) => stream.finalTextSha256));
  const parity =
    hashes.size === 1 && !hashes.has(null) && !hashes.has(undefined);

  if (!preflight) {
    return check([['inconclusive', 'no preflight']], { parity });
  }
  if (
    preflight.cell !== receipt.cell ||
    preflight.sourceHash !== receipt.sourceHash
  ) {
    reasons.push(['fail', 'preflight belongs to another cell or source']);
  }
  for (const arm of arms) {
    const reference = preflight[arm];

    if (!reference) {
      reasons.push(['inconclusive', `no ${arm} preflight`]);
      continue;
    }
    if (reference.pass !== true) {
      reasons.push(['fail', `${arm} preflight did not pass`]);
      continue;
    }
    for (const stream of streams.filter((entry) => entry.arm === arm)) {
      if (!stream.buildId) {
        reasons.push([
          'inconclusive',
          `${arm} ${stream.role} build unidentified`,
        ]);
      } else if (stream.buildId !== reference.buildId) {
        reasons.push(['fail', `${arm} ${stream.role} served another build`]);
      }
      if (!stream.finalTextSha256) {
        reasons.push([
          'inconclusive',
          `${arm} ${stream.role} final text missing`,
        ]);
      } else if (stream.finalTextSha256 !== reference.referenceTextSha256) {
        reasons.push([
          'fail',
          `${arm} ${stream.role} final text differs from its reference`,
        ]);
      }
    }
  }
  if (
    preflight.baseline?.buildId &&
    preflight.baseline.buildId === preflight.candidate?.buildId
  ) {
    reasons.push(['fail', 'both arms serve the same build']);
  }
  const [baselineReference, candidateReference] = arms.map(
    (arm) => preflight[arm]?.referenceTextSha256
  );
  if (
    baselineReference &&
    candidateReference &&
    baselineReference !== candidateReference
  ) {
    reasons.push(['fail', 'arms disagree on the reference text']);
  }

  return check(reasons, { parity });
}

function assessAttribution(receipt, policy) {
  const reasons = [];
  const { streams } = measuredStreams(receipt, policy);
  const ratios = [];

  for (const stream of streams) {
    const shares = profileShares.map(
      (share) => stream.profile?.stream?.[share]
    );
    const label = `${stream.arm} ${stream.role}`;

    if (stream.profile?.aligned !== true) {
      reasons.push(['inconclusive', `${label} profile missing or unaligned`]);
      continue;
    }
    if (!shares.every(isDuration) || !(stream.trace?.totalMs > 0)) {
      reasons.push(['inconclusive', `${label} profile totals invalid`]);
      continue;
    }

    const sampled = shares.reduce((sum, value) => sum + value, 0);
    const ratio = sampled / stream.trace.totalMs;
    const programShare =
      sampled > 0 ? stream.profile.stream.program / sampled : 1;

    ratios.push(ratio);
    if (ratio < policy.profile.minRatio || ratio > policy.profile.maxRatio) {
      reasons.push([
        'inconclusive',
        `${label} sampled/trace ratio ${ratio.toFixed(3)}`,
      ]);
    }
    if (programShare >= policy.profile.maxProgramShare) {
      reasons.push([
        'inconclusive',
        `${label} program share ${programShare.toFixed(3)}`,
      ]);
    }
  }

  return check(reasons, {
    maxRatio: ratios.length ? Math.max(...ratios) : null,
    minRatio: ratios.length ? Math.min(...ratios) : null,
  });
}

function assessWork(receipt, policy) {
  const reasons = [];
  const { roles, streams } = measuredStreams(receipt, policy);
  const work = (stream) =>
    (stream?.profile?.stream?.parse ?? Number.NaN) +
    (stream?.profile?.stream?.transaction ?? Number.NaN);
  const pairs = roles.map((role) => {
    const find = (arm) =>
      streams.find((stream) => stream.role === role && stream.arm === arm);

    return {
      baseline: work(find('baseline')),
      candidate: work(find('candidate')),
      role,
    };
  });

  if (
    !pairs.every(
      (pair) => isDuration(pair.baseline) && isDuration(pair.candidate)
    )
  ) {
    return check([['inconclusive', 'work operands missing or invalid']]);
  }

  const gains = pairs.map((pair) => pair.baseline - pair.candidate);
  const spread = Math.max(
    ...arms.map(
      (arm) =>
        Math.max(...pairs.map((pair) => pair[arm])) -
        Math.min(...pairs.map((pair) => pair[arm]))
    )
  );

  pairs.forEach((pair, index) => {
    if (gains[index] < policy.work.minGainMs) {
      reasons.push(['fail', `${pair.role} saves ${gains[index].toFixed(1)}ms`]);
    } else if (gains[index] < pair.baseline * policy.work.minGainRatio) {
      reasons.push([
        'fail',
        `${pair.role} saves under ${policy.work.minGainRatio * 100}%`,
      ]);
    }
  });
  if (Math.min(...gains) <= spread) {
    reasons.push(['fail', 'smallest gain is inside arm variation']);
  }

  return check(reasons, { gainsMs: gains, pairs, spreadMs: spread });
}

const assessors = Object.freeze({
  attribution: assessAttribution,
  completeness: assessCompleteness,
  correctness: assessCorrectness,
  latency: assessLatency,
  work: assessWork,
});

export function assessCell(receipt, policy) {
  const checks = Object.fromEntries(
    policy.checks.map((name) => [name, assessors[name](receipt, policy)])
  );
  const statuses = new Set(Object.values(checks).map((entry) => entry.status));

  return {
    cell: receipt.cell,
    checks,
    verdict: statuses.has('fail')
      ? 'fail'
      : statuses.has('inconclusive')
        ? 'inconclusive'
        : 'pass',
  };
}

export function assessMatrix(matrixDir, policyId) {
  const policy = policies[policyId];
  if (!policy) {
    throw new Error(
      `Unknown policy ${policyId}; use one of ${Object.keys(policies).join(', ')}`
    );
  }

  const files = fs
    .readdirSync(matrixDir)
    .filter((file) => file.endsWith('.json') && !file.startsWith('budget'))
    .sort();
  const receipts = files.map((file) => {
    const bytes = fs.readFileSync(path.join(matrixDir, file));

    return {
      file,
      receipt: JSON.parse(bytes.toString('utf-8')),
      sha256: createHash('sha256').update(bytes).digest('hex'),
    };
  });

  return {
    cells: receipts.map(({ receipt }) => assessCell(receipt, policy)),
    evaluatorSha256: createHash('sha256')
      .update(fs.readFileSync(fileURLToPath(import.meta.url)))
      .digest('hex'),
    policy,
    receipts: Object.fromEntries(
      receipts.map(({ file, sha256 }) => [file, sha256])
    ),
  };
}

function main(argv) {
  const [matrixDir, ...rest] = argv;
  const option = (name) => {
    const index = rest.indexOf(`--${name}`);
    return index === -1 ? undefined : rest[index + 1];
  };
  const policyId = option('policy');
  const out = option('out');

  if (!matrixDir || !policyId || !out) {
    throw new Error(
      'Usage: node markdown-streaming-measurement.mjs <matrix-dir> --policy <id> --out <new-assessment-file>'
    );
  }

  const resolvedOut = path.resolve(out);
  const resolvedMatrix = path.resolve(matrixDir);
  if (fs.existsSync(resolvedOut)) {
    throw new Error(`Refusing to overwrite ${out}`);
  }
  if (!path.relative(resolvedMatrix, resolvedOut).startsWith('..')) {
    throw new Error('Write the assessment outside the matrix directory');
  }

  const assessment = assessMatrix(resolvedMatrix, policyId);
  fs.mkdirSync(path.dirname(resolvedOut), { recursive: true });
  fs.writeFileSync(resolvedOut, `${JSON.stringify(assessment, null, 2)}\n`);
  for (const cell of assessment.cells) {
    console.log(`${cell.cell}: ${cell.verdict}`);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
