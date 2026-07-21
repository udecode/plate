import assert from 'node:assert/strict';
import test from 'node:test';

import {
  closureColumnIndexes,
  isActionableLedgerValue,
  isClosedLedgerValue,
  removedPlateSchemaFlagsPattern,
  removedRootMutationFacadePattern,
} from './check-plite-docs.mjs';

test('classifies actionable research ledger statuses explicitly', () => {
  for (const status of [
    'candidate',
    'open',
    'promoted-pending',
    'needs-review',
    'queued',
    'todo',
    'untriaged',
  ]) {
    assert.equal(isActionableLedgerValue(status), true, status);
    assert.equal(isClosedLedgerValue(status), false, status);
  }
});

test('classifies closed research ledger statuses explicitly', () => {
  for (const status of [
    'closed',
    'defer',
    'deferred-architecture',
    'deferred-proof-width',
    'done',
    'kept: focused proof passes',
    'promoted-kept',
    'quarantined: unrelated generated artifact lint',
    'supporting',
  ]) {
    assert.equal(isActionableLedgerValue(status), false, status);
    assert.equal(isClosedLedgerValue(status), true, status);
  }
});

test('prefers status over decision as the closure column', () => {
  assert.deepEqual(
    closureColumnIndexes(['lead_key', 'status', 'next_action', 'decision']),
    [1]
  );
  assert.deepEqual(closureColumnIndexes(['lead_key', 'decision']), [1]);
});

test('detects removed root mutation facades in current teaching docs', () => {
  for (const source of [
    'editor.tf.insertText("x")',
    'editor.transforms.insertText("x")',
    '.overrideEditor(({ api }) => ({ api }))',
    'tf: { insertText() {} }',
  ]) {
    assert.match(source, removedRootMutationFacadePattern, source);
  }

  for (const source of [
    'editor.update.text.insert("x")',
    'editor.update((tx) => tx.text.insert("x"))',
    '.extendTx(() => (tx) => ({ insertText() {} }))',
  ]) {
    assert.doesNotMatch(source, removedRootMutationFacadePattern, source);
  }
});

test('detects removed Plate schema flags without banning parser overrides', () => {
  for (const source of [
    'node.isElement: true',
    'node.isLeaf: true',
    'setting both isElement and isLeaf to true',
  ]) {
    assert.match(source, removedPlateSchemaFlagsPattern, source);
  }

  for (const source of [
    'node: { element: {} }',
    'node: { mark: true }',
    'deserializer: { isElement: true }',
    'inject: { isLeaf: true }',
  ]) {
    assert.doesNotMatch(source, removedPlateSchemaFlagsPattern, source);
  }
});
