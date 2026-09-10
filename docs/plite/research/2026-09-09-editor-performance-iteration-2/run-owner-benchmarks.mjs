import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { basename, resolve } from 'node:path';
import { runBenchmarkTarget } from '../../../../tooling/scripts/bench-targets.mjs';
import { runBoundedProcess } from '../../../../tooling/scripts/run-bounded-process.mjs';

const root = resolve(import.meta.dirname, '../../../..');
const output = resolve(
  root,
  'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2',
  process.env.ITERATION_2_BENCH_PACKET ?? 'owner-benchmarks'
);
mkdirSync(output, { recursive: true });
const registry = JSON.parse(
  readFileSync(resolve(root, 'benchmarks/targets/slate-v2.json'), 'utf8')
);
const requestedIds = process.env.ITERATION_2_BENCH_TARGETS?.split(',');
const selected = registry.targets.filter((target, index) =>
  requestedIds
    ? requestedIds.includes(target.id)
    : index < 9 || (index >= 17 && index < 20) || (index >= 27 && index < 47)
);
if (requestedIds?.some((id) => !selected.some((target) => target.id === id)))
  throw new Error('Unknown registered target ID');
const sourcePaths = JSON.parse(
  readFileSync(
    resolve(
      root,
      'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2/source-inventory.json'
    ),
    'utf8'
  )
);
const hash = (value) => createHash('sha256').update(value).digest('hex');
const trackedInputs = (
  Array.isArray(sourcePaths)
    ? sourcePaths
    : (sourcePaths.files ?? sourcePaths.units ?? sourcePaths.records)
).map((row) => (typeof row === 'string' ? row : (row.path ?? row.file)));
const fingerprint = () =>
  Object.fromEntries(
    trackedInputs.map((file) => [
      file,
      existsSync(resolve(root, file))
        ? hash(readFileSync(resolve(root, file)))
        : null,
    ])
  );
const proofFingerprint = () =>
  hash(
    JSON.stringify({
      sources: fingerprint(),
      baseURL: process.env.PLAYWRIGHT_BASE_URL ?? null,
      hostManifest: existsSync(
        resolve(root, 'apps/plite/out/.plite-proof-build.json')
      )
        ? hash(
            readFileSync(
              resolve(root, 'apps/plite/out/.plite-proof-build.json')
            )
          )
        : null,
    })
  );
const correctnessCache = new Map();
if (process.env.ITERATION_2_CORRECTNESS_REUSE_FROM) {
  const previous = JSON.parse(
    readFileSync(
      resolve(root, process.env.ITERATION_2_CORRECTNESS_REUSE_FROM),
      'utf8'
    )
  );
  const currentFingerprint = proofFingerprint();
  for (const result of previous.results)
    for (const receipt of result.commands) {
      if (
        receipt.command !== result.correctness ||
        receipt.sourceFingerprint !== currentFingerprint ||
        !existsSync(receipt.log)
      )
        continue;
      correctnessCache.set(`${receipt.command}\0${currentFingerprint}`, {
        receipt,
        processResult: {
          status: receipt.status,
          signal: receipt.signal,
          error: receipt.error,
          stdout: readFileSync(receipt.log, 'utf8'),
          stderr: '',
        },
      });
    }
}
const packet = {
  startedAt: new Date().toISOString(),
  registry: 'benchmarks/targets/slate-v2.json',
  selection: requestedIds
    ? 'Explicit registered targets supplied for this packet; original commands, budgets and sampling remain intact.'
    : 'The 32 registered headless owner and substrate comparison targets, with their original correctness commands, budgets and sampling. Browser targets are separate packets.',
  correctnessReuse:
    'Identical correctness commands reuse a recorded result only while all captured source inputs, explicit host URL and static-host manifest have the same fingerprint. Reuse is recorded per command, including failed guards. It does not repeat an unchanged broad check.',
  expected: selected.length,
  sourceBefore: fingerprint(),
  results: [],
};
const save = () =>
  writeFileSync(
    resolve(output, 'results.json'),
    `${JSON.stringify(packet, null, 2)}\n`
  );
save();

for (const registered of selected) {
  const target = structuredClone(registered);
  if (
    ['decoration-manager-scalability', 'core-document-change-current'].includes(
      target.id
    )
  ) {
    const original = target.artifacts[0].path;
    const redirected = resolve(output, basename(original));
    target.command = target.command.includes('--output=')
      ? target.command.replace(/--output=\S+/, `--output=${redirected}`)
      : `${target.command} --output=${redirected}`;
    target.artifacts[0].path = redirected;
  }
  const result = {
    id: target.id,
    startedAt: new Date().toISOString(),
    command: target.command,
    correctness: target.correctness.command,
    commands: [],
    status: 'running',
  };
  packet.results.push(result);
  save();
  try {
    const metric = await runBenchmarkTarget(target, {
      repoRoot: root,
      writeOutput: false,
      runProcess: async (options) => {
        const startedAt = new Date().toISOString();
        const isCorrectness = options.command === target.correctness.command;
        const before = isCorrectness ? proofFingerprint() : null;
        const cacheKey = isCorrectness ? `${options.command}\0${before}` : null;
        const cached = cacheKey ? correctnessCache.get(cacheKey) : null;
        if (cached) {
          result.commands.push({
            ...cached.receipt,
            startedAt,
            reusedFrom: cached.receipt.log,
            sourceFingerprint: before,
            executed: false,
          });
          save();
          return cached.processResult;
        }
        const processResult = await runBoundedProcess(options);
        const index = result.commands.length;
        const log = resolve(output, `${target.id}.${index}.log`);
        writeFileSync(
          log,
          `${processResult.stdout ?? ''}\n${processResult.stderr ?? ''}`
        );
        const receipt = {
          command: options.command,
          startedAt,
          finishedAt: new Date().toISOString(),
          status: processResult.status,
          signal: processResult.signal,
          error: processResult.error ? String(processResult.error) : null,
          timeoutMs: options.timeoutMs,
          log,
          executed: true,
          sourceFingerprint: before,
          metrics: [
            ...(processResult.stdout ?? '').matchAll(
              /^METRIC ([^=]+)=([^\s]+)$/gm
            ),
          ].map((match) => ({ name: match[1], value: Number(match[2]) })),
        };
        result.commands.push(receipt);
        if (cacheKey && before === proofFingerprint())
          correctnessCache.set(cacheKey, { processResult, receipt });
        save();
        return processResult;
      },
    });
    Object.assign(result, metric, { status: 'pass' });
  } catch (error) {
    result.status = 'fail';
    result.error = String(error);
  }
  result.artifacts = target.artifacts.map((artifact) => {
    const source = resolve(root, artifact.path);
    if (!existsSync(source)) return { ...artifact, captured: false };
    const destination = resolve(output, `${target.id}-${basename(source)}`);
    copyFileSync(source, destination);
    return {
      ...artifact,
      captured: true,
      destination,
      sha256: hash(readFileSync(source)),
      freshness:
        result.status === 'pass'
          ? 'Required freshness verified by canonical target runner.'
          : 'May predate the failure; inspect timestamps and command log before using.',
    };
  });
  result.finishedAt = new Date().toISOString();
  save();
  console.log(
    JSON.stringify({
      id: result.id,
      status: result.status,
      primaryMetric: result.primaryMetric,
      error: result.error,
    })
  );
}
packet.finishedAt = new Date().toISOString();
packet.sourceAfter = fingerprint();
packet.changedSources = trackedInputs.filter(
  (file) => packet.sourceBefore[file] !== packet.sourceAfter[file]
);
packet.summary = {
  pass: packet.results.filter((result) => result.status === 'pass').length,
  fail: packet.results.filter((result) => result.status === 'fail').length,
  expected: packet.expected,
};
save();
console.log(JSON.stringify(packet.summary));
