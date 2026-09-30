import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const directory = 'docs/research/probes/2026-09-30-content-root-locations';
const read = (name) => JSON.parse(readFileSync(`${directory}/${name}.json`, 'utf8'));
const current = read('current');
const prototype = read('scoped-prototype');
const features = read('feature-current');
const featurePrototype = read('feature-prototype');
const composition = read('composition-current');
const sha = (value) => createHash('sha256').update(value).digest('hex');
for (const packet of [current, prototype, features, featurePrototype]) {
  for (const [file, expected] of Object.entries(packet.source)) {
    assert.equal(sha(readFileSync(file)), expected, `Stale source: ${file}`);
  }
}
assert.equal(current.runtime, prototype.runtime);
assert.deepEqual(current.host, prototype.host);
assert.equal(features.runtime, featurePrototype.runtime);
assert.equal(prototype.composition.named, 'SOURCE NOTES');
assert.equal(prototype.composition.readOnly, true);
assert.equal(prototype.composition.independent, true);
const rows = prototype.samples.map((target, index) => {
  const baseline = current.samples[index];
  assert.equal(target.roots, baseline.roots);
  assert.equal(target.payloadBytes, baseline.payloadBytes);
  for (const counts of target.counts) {
    assert.equal(counts.validations, 1);
    assert.equal(counts.views, target.roots + 1);
    assert.equal(counts.indexBuilds, 0);
  }
  for (const counts of baseline.counts) assert.equal(counts.validations, baseline.roots + 1);
  if (target.roots <= 10) {
    assert.ok(target.medianMs.warm <= target.medianMs.control * 1.1 + 0.5);
    assert.ok(target.medianMs.totalCold - target.medianMs.control < 2);
  }
  return { roots: target.roots, payloadBytes: target.payloadBytes, jsonBytes: target.jsonBytes, current: baseline.medianMs, prototype: target.medianMs, validations: {current:baseline.counts[0].validations,prototype:1}, indexBuilds:0, result:'pass' };
});
const median = (values) => [...values].sort((left,right) => left-right)[Math.floor(values.length / 2)];
const featureRows = featurePrototype.results.map((target,index) => {
  const baseline = features.results[index];
  assert.equal(target.unrelated, baseline.unrelated);
  assert.equal(target.correctness, 'pass');
  target.samples.forEach(sample => assert.equal(sample.indexBuilds,0));
  baseline.samples.forEach(sample => assert.equal(sample.indexBuilds,2));
  const currentMs = median(baseline.samples.map(sample=>sample.duration));
  const targetMs = median(target.samples.map(sample=>sample.duration));
  assert.ok(targetMs <= currentMs * 1.1 + 0.5);
  return { unrelatedParagraphs:target.unrelated, currentMs, prototypeMs:targetMs, indexBuilds:{current:2,prototype:0}, result:'pass' };
});
const report = { result:'pass', purpose:'Design falsification only; no production or browser proof', sourceFreshness:'matching', sampling:'Six packets after two warmups; paired control/cold order within each process; no p95 or speedup claim', composition:composition.findings, scopedRows:rows, featureRows, limits:'Disposable Bun source transforms; raw root fixture uses open Plite grammar, owned-root feature fixture uses real Plate schema. Root probe uses one API/read plugin, not the full registry kit. Feature probes use List/Table and one figure plugin, a two-item list and a 1×1 table. Authored inheritance, schema reconfiguration, range admission, static/live callback delivery, spans, structural reuse and native/browser behavior remain production adoption gates. Pathological input has 50 KB text payload plus root structure; it is not a 50 KB serialized document. Candidate and baseline ran in separate processes, with local controls; large deterministic work deltas support owner acceptance, not precise cross-process percentiles.' };
writeFileSync(`${directory}/summary.json`, `${JSON.stringify(report,null,2)}\n`);
console.log(JSON.stringify({result:report.result,sourceFreshness:report.sourceFreshness,scopedRows:rows.map(({roots,validations,prototype})=>({roots,validations,totalColdMs:prototype.totalCold})),featureRows},null,2));
