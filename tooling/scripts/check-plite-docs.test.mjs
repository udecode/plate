import assert from 'node:assert/strict';
import test from 'node:test';

import {
  closureColumnIndexes,
  isActionableLedgerValue,
  isClosedLedgerValue,
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
