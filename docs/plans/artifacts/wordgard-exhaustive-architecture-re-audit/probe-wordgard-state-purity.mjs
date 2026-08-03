#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const artifactRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(artifactRoot, '../../../..');
const wordgardRoot = resolve(repositoryRoot, '../wordgard');
const fromDist = (name) =>
  import(pathToFileURL(resolve(wordgardRoot, `dist/${name}.js`)).href);

const [
  { GardState, Transaction },
  { collab },
  { Leaf },
  { basicSchema },
  { history },
] = await Promise.all([
  fromDist('state'),
  fromDist('collab'),
  fromDist('doc'),
  fromDist('schema'),
  fromDist('history'),
]);

const collabBase = GardState.create({
  config: [basicSchema(), collab({ clientID: 'audit' })],
});
const collabAfterA = collabBase.update({
  changes: { from: 1, insert: [Leaf.text('A')] },
}).state;
const derivedBeforeLock = collabAfterA.update({
  changes: { from: 2, insert: [Leaf.text('B')] },
}).state;
const beforeText = collab
  .sendableUpdate(derivedBeforeLock)
  .changes.apply(collabBase.doc)
  .textContent();
const lockedText = collab
  .sendableUpdate(collabAfterA)
  .changes.apply(collabBase.doc)
  .textContent();
const derivedAfterLock = collabAfterA.update({
  changes: { from: 2, insert: [Leaf.text('B')] },
}).state;
const afterText = collab
  .sendableUpdate(derivedAfterLock)
  .changes.apply(collabBase.doc)
  .textContent();

const historyBase = GardState.create({
  config: [basicSchema(), history()],
});
const historyAfterA = historyBase.update({
  changes: { from: 1, insert: [Leaf.text('A')] },
}).state;
const mappedHistory = historyAfterA.update({
  annotations: Transaction.addToHistory.of(false),
  changes: { from: 2, insert: [Leaf.text('B')] },
}).state;
const historyValue = mappedHistory.field(history.field);
const doneBeforeSerialization = historyValue.done;
mappedHistory.toJSON({ history: history.field });

const result = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  wordgardHead: execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: wordgardRoot,
    encoding: 'utf8',
  }).trim(),
  collab: {
    derivedBeforeReservation: beforeText,
    reservation: lockedText,
    derivedAfterReservation: afterText,
    observationallyPure: beforeText === afterText,
  },
  history: {
    branchIdentityPreserved: doneBeforeSerialization === historyValue.done,
    fieldIdentityPreserved: historyValue === mappedHistory.field(history.field),
  },
};

if (
  result.collab.derivedBeforeReservation !== 'AB' ||
  result.collab.reservation !== 'A' ||
  result.collab.derivedAfterReservation !== 'A' ||
  result.collab.observationallyPure ||
  result.history.branchIdentityPreserved ||
  !result.history.fieldIdentityPreserved
) {
  throw new Error(
    `Wordgard state-purity behavior changed; re-audit required: ${JSON.stringify(result)}`
  );
}

writeFileSync(
  resolve(artifactRoot, 'wordgard-state-purity-probe.json'),
  `${JSON.stringify(result, null, 2)}\n`
);
process.stdout.write(`${JSON.stringify(result)}\n`);
