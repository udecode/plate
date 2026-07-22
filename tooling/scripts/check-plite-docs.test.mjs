import assert from 'node:assert/strict';
import test from 'node:test';

import {
  closureColumnIndexes,
  isActionableLedgerValue,
  isClosedLedgerValue,
  isCurrentSchemaAdoptionDoc,
  removedCaptionTargetOptionsPattern,
  removedHeadingLevelsOptionsPattern,
  removedPlateNodeBagPattern,
  removedPlateSchemaFlagsPattern,
  removedRootMutationFacadePattern,
  removedSchemaTargetOptionsPattern,
} from './check-plite-docs.mjs';

test('audits current schema docs but not historical migration snapshots', () => {
  assert.equal(
    isCurrentSchemaAdoptionDoc('content/docs/(plugins)/(elements)/mention.mdx'),
    true
  );
  assert.equal(
    isCurrentSchemaAdoptionDoc('content/docs/migration/v48.mdx'),
    false
  );
});

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
    'node.element defines content',
    'node.mark defines a text property',
    'node.component owns rendering',
    'node.isElement: true',
    'node.isLeaf: true',
    'The mention node is isMarkableVoid',
    'setting both isElement and isLeaf to true',
  ]) {
    assert.match(source, removedPlateSchemaFlagsPattern, source);
  }

  for (const source of [
    'deserializer: { isElement: true }',
    'inject: { isLeaf: true }',
    'ParagraphPlugin.withComponent(ParagraphElement)',
    'render: { node: ParagraphElement }',
    "schema: { element: { void: 'markable-inline' } }",
    'state.schema.markableVoid(element)',
  ]) {
    assert.doesNotMatch(source, removedPlateSchemaFlagsPattern, source);
  }
});

test('detects the deleted Plate node bag without matching unrelated node or mark fields', () => {
  for (const source of [
    'node: { element: {} }',
    'node: { mark: true }',
    'node: { type: "paragraph" }',
    'node: { component: ParagraphElement }',
    'node: { isDecoration: true }',
    'node: {\n  isElement: true,\n  isInline: true\n}',
    'node: {\n  dangerouslyAllowAttributes: ["target"],\n  isElement: true\n}',
    'node: { toDataAttributes: ({ node }) => ({ id: node.id }) }',
  ]) {
    assert.match(source, removedPlateNodeBagPattern, source);
  }

  for (const source of [
    'render: { node: LinkElement }',
    'match: ({ node }) => ElementApi.isElement(node)',
    'deserializer: { parse: ({ node }) => node }',
    'rules: { emphasis: { mark: true } }',
  ]) {
    assert.doesNotMatch(source, removedPlateNodeBagPattern, source);
  }
});

test('detects schema target strings stored in runtime options', () => {
  assert.match(
    'options: { targetPluginKeys: [KEYS.p] }',
    removedSchemaTargetOptionsPattern
  );
  assert.doesNotMatch(
    'config: { targets: [ParagraphPlugin] }',
    removedSchemaTargetOptionsPattern
  );
});

test('detects caption targets stored in runtime query options', () => {
  assert.match(
    'options: { query: { allow: [KEYS.img] } }',
    removedCaptionTargetOptionsPattern
  );
  assert.doesNotMatch(
    'config: { targets: [ImagePlugin] }',
    removedCaptionTargetOptionsPattern
  );
});

test('detects heading levels stored in runtime options', () => {
  for (const source of [
    'BaseHeadingPlugin.configure({ options: { levels: 3 } })',
    'HeadingPlugin options.levels selects enabled levels',
  ]) {
    assert.match(source, removedHeadingLevelsOptionsPattern);
  }

  assert.doesNotMatch(
    'BaseHeadingPlugin.configure({ config: { levels: 3 } })',
    removedHeadingLevelsOptionsPattern
  );
});
