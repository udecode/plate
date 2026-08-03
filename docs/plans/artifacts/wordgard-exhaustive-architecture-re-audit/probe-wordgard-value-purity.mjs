#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const artifactRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(artifactRoot, '../../../..');
const wordgardRoot = resolve(repositoryRoot, '../wordgard');
const fromDist = (name) =>
  import(pathToFileURL(resolve(wordgardRoot, `dist/${name}.js`)).href);

const [
  { Leaf, Slice },
  { GardState },
  { basicSchema },
  { Emphasis, Paragraph, Strong },
] = await Promise.all([
  fromDist('doc'),
  fromDist('state'),
  fromDist('schema'),
  fromDist('types'),
]);

const plotInput = [Leaf.text('A')];
const plot = Paragraph.create(plotInput);
const plotBefore = {
  contentLength: plot.contentLength,
  json: plot.toJSON(),
  length: plot.length,
  text: plot.textContent(),
};
plotInput.push(Leaf.text('B'));
const plotAfter = {
  contentLength: plot.contentLength,
  json: plot.toJSON(),
  length: plot.length,
  text: plot.textContent(),
};

const sliceInput = [Leaf.text('A')];
const slice = Slice.of(sliceInput);
const sliceBefore = {
  json: slice.toJSON(),
  length: slice.length,
  text: slice.textContent(),
};
sliceInput.push(Leaf.text('B'));
const sliceAfter = {
  json: slice.toJSON(),
  length: slice.length,
  text: slice.textContent(),
};

const markInput = [Strong];
const markedLeaf = Leaf.text('A', markInput);
const marksBefore = {
  json: markedLeaf.toJSON(),
  text: markedLeaf.toString(),
};
markInput.push(Emphasis);
const marksAfter = {
  json: markedLeaf.toJSON(),
  text: markedLeaf.toString(),
};

const transactionBase = GardState.create({ config: [basicSchema()] });
const transaction = transactionBase.update({
  changes: { from: 1, insert: [Leaf.text('A')] },
});
const transactionBefore = {
  appliedChangeText: transaction.changes
    .apply(transactionBase.doc)
    .textContent(),
  newDocText: transaction.newDoc.textContent(),
  startDocText: transactionBase.doc.textContent(),
};
transaction.newDoc = transactionBase.doc;
const transactionAfter = {
  appliedChangeText: transaction.changes
    .apply(transactionBase.doc)
    .textContent(),
  newDocText: transaction.newDoc.textContent(),
  publishedStateText: transaction.state.doc.textContent(),
};

const throwingField = GardState.Field.define({
  create: () => 0,
  update: () => {
    throw new Error('audit update failure');
  },
});
const failedStateBase = GardState.create({
  config: [basicSchema(), throwingField],
});
const failedStateTransaction = failedStateBase.update({
  changes: { from: 1, insert: [Leaf.text('A')] },
});
let firstStateError;
try {
  void failedStateTransaction.state;
} catch (error) {
  firstStateError = error instanceof Error ? error.message : String(error);
}
const cachedPartialState = failedStateTransaction._state !== null;
let secondStateDocText;
let secondStateFieldError;
try {
  secondStateDocText = failedStateTransaction.state.doc.textContent();
  failedStateTransaction.state.field(throwingField);
} catch (error) {
  secondStateFieldError =
    error instanceof Error ? error.message : String(error);
}

const result = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  wordgardHead: execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: wordgardRoot,
    encoding: 'utf8',
  }).trim(),
  plotInputAliasing: {
    before: plotBefore,
    after: plotAfter,
    cachedLengthMatchesContent: plotAfter.contentLength === 2,
  },
  sliceInputAliasing: {
    before: sliceBefore,
    after: sliceAfter,
    cachedLengthMatchesContent: sliceAfter.length === 2,
  },
  markSetInputAliasing: {
    before: marksBefore,
    after: marksAfter,
    valuePreserved: JSON.stringify(marksBefore) === JSON.stringify(marksAfter),
  },
  writableTransactionNewDoc: {
    before: transactionBefore,
    after: transactionAfter,
    publishedStateMatchesChanges:
      transactionAfter.publishedStateText ===
      transactionAfter.appliedChangeText,
  },
  failedTransactionStateResolution: {
    firstStateError,
    cachedPartialState,
    secondStateDocText,
    secondStateFieldError,
    failureRemainedAtomic:
      !cachedPartialState &&
      secondStateDocText === undefined &&
      secondStateFieldError === firstStateError,
  },
};

if (
  result.wordgardHead !== 'c715d4ded8fc780f52c13206e589ea31e4148dd4' ||
  result.plotInputAliasing.before.text !== 'A' ||
  result.plotInputAliasing.after.text !== 'AB' ||
  result.plotInputAliasing.before.contentLength !== 1 ||
  result.plotInputAliasing.after.contentLength !== 1 ||
  result.plotInputAliasing.cachedLengthMatchesContent ||
  result.sliceInputAliasing.before.text !== 'A' ||
  result.sliceInputAliasing.after.text !== 'AB' ||
  result.sliceInputAliasing.before.length !== 1 ||
  result.sliceInputAliasing.after.length !== 1 ||
  result.sliceInputAliasing.cachedLengthMatchesContent ||
  result.markSetInputAliasing.before.text !== '"A"[Strong]' ||
  result.markSetInputAliasing.after.text !== '"A"[Strong,Emphasis]' ||
  result.markSetInputAliasing.valuePreserved ||
  result.writableTransactionNewDoc.before.appliedChangeText !== 'A' ||
  result.writableTransactionNewDoc.before.newDocText !== 'A' ||
  result.writableTransactionNewDoc.after.appliedChangeText !== 'A' ||
  result.writableTransactionNewDoc.after.newDocText !== '' ||
  result.writableTransactionNewDoc.after.publishedStateText !== '' ||
  result.writableTransactionNewDoc.publishedStateMatchesChanges ||
  result.failedTransactionStateResolution.firstStateError !==
    'audit update failure' ||
  !result.failedTransactionStateResolution.cachedPartialState ||
  result.failedTransactionStateResolution.secondStateDocText !== 'A' ||
  result.failedTransactionStateResolution.secondStateFieldError !==
    'Cyclic dependency between fields and/or facets' ||
  result.failedTransactionStateResolution.failureRemainedAtomic
) {
  throw new Error(
    `Wordgard value-purity behavior changed; re-audit required: ${JSON.stringify(result)}`
  );
}

writeFileSync(
  resolve(artifactRoot, 'wordgard-value-purity-probe.json'),
  `${JSON.stringify(result, null, 2)}\n`
);
process.stdout.write(`${JSON.stringify(result)}\n`);
