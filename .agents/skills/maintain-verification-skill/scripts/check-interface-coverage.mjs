#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const verbs = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']);
const writes = new Set(['post', 'put', 'patch', 'delete']);
const dispositions = new Set([
  'COVERED', 'REPAIR_EXISTING', 'PRD_READY', 'DECISION_REQUIRED',
  'CUSTOMER_CONDITIONAL', 'DEFERRED', 'REJECTED',
]);
const excluded = new Set(['DEFERRED', 'REJECTED']);
const options = {};
for (let index = 2; index < process.argv.length; index += 1) {
  const arg = process.argv[index];
  if (arg === '--require-reviewed' || arg === '--require-covered') {
    options[arg.slice(2)] = true;
  } else if (['--spec', '--coverage', '--tag'].includes(arg)) {
    const value = process.argv[++index];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${arg}`);
    options[arg.slice(2)] = value;
  } else {
    throw new Error(`Unknown option: ${arg}`);
  }
}
if (!options.spec || !options.coverage) {
  throw new Error('Usage: check-interface-coverage.mjs --spec <OpenAPI 3 JSON> --coverage <JSON> [--tag <tag>] [--require-reviewed] [--require-covered]');
}

const specBytes = await readFile(options.spec);
const spec = JSON.parse(specBytes);
const coverage = JSON.parse(await readFile(options.coverage, 'utf8'));
const specSha256 = createHash('sha256').update(specBytes).digest('hex');
const errors = [];
if (!String(spec.openapi).startsWith('3.') || !spec.paths) {
  throw new Error('The specification must be OpenAPI 3 with paths.');
}
if (coverage.schemaVersion !== 1 || !Array.isArray(coverage.operations)) {
  throw new Error('The coverage register must have schemaVersion 1 and an operations array.');
}
if (coverage.specSha256 !== specSha256) errors.push('Specification fingerprint changed; reconcile the register before claiming coverage.');

const operations = [];
const known = new Map();
for (const [path, item] of Object.entries(spec.paths)) {
  if (item.$ref) errors.push(`${path}: resolve the path-item reference before inventorying operations.`);
  for (const [method, operation] of Object.entries(item)) {
    if (!verbs.has(method)) continue;
    const id = operation.operationId;
    if (typeof id !== 'string' || !id.trim()) {
      errors.push(`${method.toUpperCase()} ${path}: missing operationId.`);
      continue;
    }
    if (known.has(id)) errors.push(`Duplicate specification operationId: ${id}`);
    const scopes = [...new Set((operation.security ?? spec.security ?? []).flatMap((requirement) => Object.values(requirement).flat()))];
    const row = { operationId: id, method: method.toUpperCase(), path, scopes, tags: operation.tags ?? [] };
    operations.push(row);
    known.set(id, row);
  }
}

const reviewed = new Map();
for (const row of coverage.operations) {
  if (!row || typeof row !== 'object') {
    errors.push('Invalid coverage row.');
    continue;
  }
  const id = row.operationId;
  if (!known.has(id)) errors.push(`Unknown operationId: ${id}`);
  if (reviewed.has(id)) errors.push(`Duplicate coverage operationId: ${id}`);
  reviewed.set(id, row);
  for (const key of ['operationId', 'outcomeId', 'authorityRef', 'nextOwner']) {
    if (typeof row[key] !== 'string' || !row[key].trim()) errors.push(`${id}: missing ${key}.`);
  }
  if (!dispositions.has(row.disposition)) errors.push(`${id}: invalid disposition.`);
  for (const [key, allowed] of [
    ['legacy', ['called', 'not_found', 'unknown']],
    ['implementation', ['present', 'partial', 'missing']],
    ['access', ['verified', 'unverified']],
    ['proof', ['source', 'fixture', 'native']],
  ]) {
    if (!allowed.includes(row[key])) errors.push(`${id}: invalid ${key}.`);
  }
  if (!Array.isArray(row.evidence) || row.evidence.length === 0 || row.evidence.some((ref) => typeof ref !== 'string' || !ref.trim())) {
    errors.push(`${id}: missing evidence references.`);
  }
  if (typeof row.gap !== 'string') errors.push(`${id}: gap must be a string.`);
  if (row.disposition === 'COVERED') {
    if (row.implementation !== 'present' || row.access !== 'verified' || row.proof !== 'native' || row.gap?.trim()) {
      errors.push(`${id}: COVERED requires present implementation, verified access, native proof and no remaining gap.`);
    }
  } else if (typeof row.gap !== 'string' || !row.gap.trim()) {
    errors.push(`${id}: record the unresolved gap or the exclusion/deferment reason.`);
  }
}

const selected = operations.filter((row) => !options.tag || row.tags.includes(options.tag));
if (selected.length === 0) errors.push(`No operations match the selected scope: ${options.tag ?? 'all'}`);
const unreviewed = selected.filter((row) => !reviewed.has(row.operationId));
const gaps = selected.filter((row) => {
  const disposition = reviewed.get(row.operationId)?.disposition;
  return disposition && disposition !== 'COVERED' && !excluded.has(disposition);
});
const reviewComplete = errors.length === 0 && unreviewed.length === 0;
const productCovered = reviewComplete && gaps.length === 0;
console.log(JSON.stringify({
  specVersion: spec.info?.version,
  specSha256,
  scope: options.tag ?? 'all',
  denominator: { all: operations.length, selected: selected.length, reads: selected.filter((row) => !writes.has(row.method.toLowerCase())).length, writes: selected.filter((row) => writes.has(row.method.toLowerCase())).length },
  reviewed: selected.length - unreviewed.length,
  reviewComplete,
  productCovered,
  errors,
  operations: selected.map((row) => ({ ...row, disposition: reviewed.get(row.operationId)?.disposition ?? 'UNREVIEWED', outcomeId: reviewed.get(row.operationId)?.outcomeId ?? null })),
}, null, 2));
if (errors.length || (options['require-reviewed'] && !reviewComplete) || (options['require-covered'] && !productCovered)) process.exitCode = 1;
