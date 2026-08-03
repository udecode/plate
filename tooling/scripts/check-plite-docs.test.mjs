import assert from 'node:assert/strict';
import test from 'node:test';

import {
  basePluginExtendComponentPattern,
  closureColumnIndexes,
  isActionableLedgerValue,
  isClosedLedgerValue,
  isCurrentSchemaAdoptionDoc,
  removedExplicitExtensionGenericPattern,
  removedDefinitionAliasNamePattern,
  removedGenericDependencyReferencePattern,
  removedRootInternalDependencyTypePattern,
  removedZeroArgumentReactPattern,
  removedExtensionApiPortalPattern,
  removedExtensionValidationPattern,
  removedLooseExtensionPortalSignaturePattern,
  removedCaptionTargetOptionsPattern,
  removedPlateNodeBagPattern,
  removedPlatePluginShapePattern,
  removedStaticCapabilityPattern,
  removedPlateSchemaFlagsPattern,
  removedRootMutationFacadePattern,
  removedSchemaTargetOptionsPattern,
  staticBaseKitReactAdapterPattern,
  staticEditorBaseReactAdapterPattern,
  terminalComponentConversionPattern,
} from './check-plite-docs.mjs';

test('detects rejected final extension and Plate plugin shapes', () => {
  assert.match(
    'editor.getApi(HistoryExtension).undo()',
    removedExtensionApiPortalPattern
  );
  assert.match(
    'validateConfiguration(context) {}',
    removedExtensionValidationPattern
  );
  assert.match(
    'defineExtension<Editor>()({ name: "typed" })',
    removedExplicitExtensionGenericPattern
  );
  assert.match(
    'extension<D extends EditorExtension<EditorExtensionDefinition>>(extension: D)',
    removedLooseExtensionPortalSignaturePattern
  );

  for (const source of [
    'type C = PluginConfig<"x">',
    'type C = InferConfig<typeof Plugin>',
    'type C = InferPluginDefinitionTree<Definition>',
    'type C = MergePlatePluginDefinitions<Definition, Extension>',
    'type C = UnifiedRuntimeBasePluginConfig',
    'plugin.__config',
    'pluginApi: {}',
    'Plugin.clone()',
    'extension: {}',
    'handlers: {}',
    'targetPluginKeys: []',
  ]) {
    assert.match(source, removedPlatePluginShapePattern, source);
  }
  for (const source of [
    'api: { run() {} }',
    'commands: {}',
    'read: {}',
    'readMiddleware: {}',
    'update: {}',
  ]) {
    assert.match(source, removedStaticCapabilityPattern, source);
  }

  for (const source of [
    'editor.extension(HistoryExtension).api.undo()',
    'validate(context) {}',
    'defineExtension("typed", { })',
    'extension<const D extends EditorExtensionReference>(extension: D)',
    'on: { keyDown() {} }',
    'commands: () => []',
    'api: () => ({ run() {} })',
    'editor.api.pluginApi.run()',
  ]) {
    assert.doesNotMatch(source, removedPlatePluginShapePattern, source);
    assert.doesNotMatch(source, removedStaticCapabilityPattern, source);
  }
});

test('accepts Base constructor components and rejects terminal conversion', () => {
  assert.doesNotMatch(
    'defineBasePlugin("p", { component: ParagraphStatic, })',
    terminalComponentConversionPattern
  );
  assert.match(
    'BaseParagraphPlugin.extend({ component: ParagraphStatic })',
    basePluginExtendComponentPattern
  );
  assert.match(
    'toPlatePlugin(BaseParagraphPlugin).configure({ component: ParagraphElement })',
    terminalComponentConversionPattern
  );
  assert.doesNotMatch(
    'toPlatePlugin(BaseParagraphPlugin, { component: ParagraphElement })',
    terminalComponentConversionPattern
  );
  assert.doesNotMatch(
    'BaseParagraphPlugin.configure({ component: ParagraphStatic })',
    terminalComponentConversionPattern
  );
});

test('keeps static/base owners free of Plate React adapters', () => {
  assert.match(
    '`basic-blocks-base-kit` adds `toPlatePlugin(BaseParagraphPlugin).configure({ component: ParagraphStatic })`.',
    staticBaseKitReactAdapterPattern
  );
  assert.match(
    [
      "import { createStaticEditor } from 'platejs/static';",
      "import { toPlatePlugin } from 'platejs/react';",
      'createStaticEditor({',
      '  plugins: [toPlatePlugin(BaseParagraphPlugin).configure({ component: ParagraphStatic })],',
      '});',
    ].join('\n'),
    staticEditorBaseReactAdapterPattern
  );
  assert.doesNotMatch(
    'For live React, use toPlatePlugin(BaseParagraphPlugin).configure({ component: ParagraphElement }).',
    staticBaseKitReactAdapterPattern
  );
});

test('names DefinitionOf aliases after the extracted definition', () => {
  for (const source of [
    'type MediaConfig = DefinitionOf<typeof MediaPlugin>',
    'type Media = DefinitionOf<typeof MediaPlugin>',
  ]) {
    assert.match(source, removedDefinitionAliasNamePattern, source);
  }

  for (const source of [
    'type MediaDefinition = DefinitionOf<typeof MediaPlugin>',
    'type RuntimeConfig = { enabled: boolean }',
  ]) {
    assert.doesNotMatch(source, removedDefinitionAliasNamePattern, source);
  }
});

test('keeps dependency internals private and React composition exact', () => {
  assert.match(
    'type Ref = EditorExtensionDependencyReference<Capability>',
    removedGenericDependencyReferencePattern
  );
  assert.match(
    "import type { InternalEditorExtensionTypeProviderOf } from '@platejs/plite'",
    removedRootInternalDependencyTypePattern
  );
  assert.match('react()', removedZeroArgumentReactPattern);

  assert.doesNotMatch(
    'type Ref = EditorExtensionDependencyReference',
    removedGenericDependencyReferencePattern
  );
  assert.doesNotMatch(
    "import type { InternalEditorExtensionTypeProviderOf } from '@platejs/plite/internal'",
    removedRootInternalDependencyTypePattern
  );
  assert.doesNotMatch(
    'react({ dom: DOMExtension })',
    removedZeroArgumentReactPattern
  );
});

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
    '.extend(() => ({ update: ({ tx }) => ({ insertText() {} }) }))',
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
    'setting both isElement and isLeaf to true',
  ]) {
    assert.match(source, removedPlateSchemaFlagsPattern, source);
  }

  for (const source of [
    'deserializer: { isElement: true }',
    'inject: { isLeaf: true }',
    'ParagraphPlugin.configure({ component: ParagraphElement })',
    'render: { leaf: ParagraphLeaf }',
    "schema: { element: { void: 'markable-inline' } }",
    'state.schema.isMarkableVoid(element)',
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
    'LinkPlugin.configure({ component: LinkElement })',
    'match: ({ node }) => ElementApi.isElement(node)',
    'deserializer: { parse: ({ node }) => node }',
    'rules: { emphasis: { mark: true } }',
  ]) {
    assert.doesNotMatch(source, removedPlateNodeBagPattern, source);
  }
});

test('detects schema target strings stored in runtime options', () => {
  assert.match(
    'options: { targetPlugins: [KEYS.p] }',
    removedSchemaTargetOptionsPattern
  );
  assert.doesNotMatch(
    'targetPlugins: [KEYS.p]',
    removedSchemaTargetOptionsPattern
  );
});

test('detects caption targets stored in runtime query options', () => {
  assert.match(
    'options: { query: { allow: [KEYS.img] } }',
    removedCaptionTargetOptionsPattern
  );
  assert.doesNotMatch(
    'targetPlugins: [KEYS.img]',
    removedCaptionTargetOptionsPattern
  );
});
