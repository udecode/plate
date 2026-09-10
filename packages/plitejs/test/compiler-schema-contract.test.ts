import { describe, expect, it } from 'bun:test';

import {
  createEditor,
  defineEditorSchema,
  defineExtension,
  defineStateField,
  property,
  schema,
} from 'plitejs';

import { getExtensionRegistry } from '../src/core/extension-registry';
import { createEditorSchemaContract } from '../src/core/schema-compiler';
import { compileEditorSchemaContract } from '../src/create-editor';

describe('compileEditorSchemaContract', () => {
  it('validates the candidate without activating fields or constructing a document', () => {
    const calls: string[] = [];
    const field = defineStateField({
      initial: () => {
        calls.push('field');
        return 1;
      },
      key: 'compile-field',
    });
    const Document = defineEditorSchema('compile-document', {
      elements: {
        section: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: {
            token: property.string({
              generate: () => {
                calls.push('generate');
                return 'token';
              },
            }),
          },
        },
      },
      root: schema.content.type('section', { min: 1 }),
      unknown: 'reject',
    });
    const Runtime = defineExtension('compile-runtime', {
      activate({ onCleanup }) {
        calls.push('activate');
        onCleanup(() => calls.push('cleanup'));
      },
      api: () => {
        calls.push('api');
        return { answer: () => 42 };
      },
      stateFields: [field],
      validate({ schema: candidate }) {
        calls.push('validate');
        expect(candidate.element('section')).toBeDefined();
      },
    });
    const editor = createEditor();
    const registry = getExtensionRegistry(editor);
    const snapshot = editor.read.runtime.snapshot();
    const result = compileEditorSchemaContract(editor, [Document, Runtime]);

    expect(JSON.parse(JSON.stringify(result))).toStrictEqual(result);
    expect(calls).toEqual(['api', 'validate']);
    expect(editor.read.runtime.snapshot()).toBe(snapshot);
    expect(getExtensionRegistry(editor)).toBe(registry);
    expect(result.elements.byType.some(({ type }) => type === 'section')).toBe(
      true
    );
    expect(compileEditorSchemaContract(editor, [Document, Runtime])).toEqual(
      result
    );
    expect(compileEditorSchemaContract(editor, [])).toEqual(
      createEditorSchemaContract(registry.schemaContributions.compiled)
    );
    expect(calls).toEqual(['api', 'validate', 'api', 'validate']);
    expect(editor.read.runtime.snapshot()).toBe(snapshot);
    expect(getExtensionRegistry(editor)).toBe(registry);

    const committed = createEditor({ extensions: [Document, Runtime] });
    expect(
      createEditorSchemaContract(
        getExtensionRegistry(committed).schemaContributions.compiled
      )
    ).toEqual(result);
    expect(calls).toContain('activate');
    expect(calls).toContain('field');
    expect(calls).toContain('generate');
  });

  it('releases failed and reentrant candidate preparation and enforces bootstrap authority', () => {
    const editor = createEditor();
    const before = getExtensionRegistry(editor);
    const Failure = defineExtension('compile-failure', {
      validate() {
        throw new Error('candidate rejected');
      },
    });
    expect(() => compileEditorSchemaContract(editor, [Failure])).toThrow(
      'candidate rejected'
    );
    const Reentrant = defineExtension('compile-reentrant', {
      validate() {
        compileEditorSchemaContract(editor, []);
      },
    });
    expect(() => compileEditorSchemaContract(editor, [Reentrant])).toThrow(
      'publication'
    );
    expect(getExtensionRegistry(editor)).toBe(before);
    expect(compileEditorSchemaContract(editor, [])).toEqual(
      createEditorSchemaContract(before.schemaContributions.compiled)
    );
    const Document = defineEditorSchema('compile-installed', {
      elements: { paragraph: { content: schema.content.text() } },
      root: schema.content.type('paragraph'),
    });
    expect(() =>
      compileEditorSchemaContract(createEditor({ extensions: [Document] }), [])
    ).toThrow('without an installed schema');
    expect(() =>
      compileEditorSchemaContract(
        createEditor({
          initialValue: [{ type: 'paragraph', children: [{ text: 'x' }] }],
        }),
        []
      )
    ).toThrow('empty editor');
  });

  it('rejects active anchors and changed documents without publishing', () => {
    const editor = createEditor();
    const snapshot = editor.read.runtime.snapshot();
    const registry = getExtensionRegistry(editor);
    const anchor = editor.anchor([], { deletion: 'nearest' });

    expect(() => compileEditorSchemaContract(editor, [])).toThrow(
      'without active anchors'
    );
    expect(editor.read.runtime.snapshot()).toBe(snapshot);
    expect(getExtensionRegistry(editor)).toBe(registry);
    expect(anchor.release()).toEqual([]);
    expect(compileEditorSchemaContract(editor, [])).toEqual(
      createEditorSchemaContract(registry.schemaContributions.compiled)
    );

    editor.update((tx) =>
      tx.nodes.insert({ type: 'paragraph', children: [{ text: 'written' }] })
    );
    const changedSnapshot = editor.read.runtime.snapshot();

    expect(() => compileEditorSchemaContract(editor, [])).toThrow(
      'unchanged document'
    );
    expect(editor.read.runtime.snapshot()).toBe(changedSnapshot);
    expect(getExtensionRegistry(editor)).toBe(registry);
  });
});
