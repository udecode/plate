import { createBaseEditor, defineBasePlugin } from '@platejs/core';
import { createEditor, schema, target, type Value } from '@platejs/plite';

import { BaseScriptPlugin } from '../lib/BaseMarkPlugins';
import { ScriptV54MigrationPlugin } from './ScriptV54MigrationPlugin';

const TestRootPlugin = defineBasePlugin('testRoot', {
  schema: ({ name, plugins }) => ({
    contentRoots: [
      {
        content: plugins.blockContent(),
        ownership: 'exclusive',
        slot: name,
        target: target.element(name),
      },
    ],
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  }),
});

describe('ScriptV54MigrationPlugin', () => {
  it('migrates legacy marks during initialization', () => {
    const editor = createBaseEditor({
      editor: createEditor<Value>(),
      plugins: [ScriptV54MigrationPlugin, BaseScriptPlugin] as const,
      initialValue: [
        {
          children: [
            { subscript: true, text: 'H' },
            { superscript: true, text: '2' },
            { subscript: false, text: 'O' },
          ],
          type: 'paragraph',
        },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
    });

    expect(editor.read.children()).toEqual([
      {
        children: [
          { script: 'sub', text: 'H' },
          { script: 'sup', text: '2' },
          { text: 'O' },
        ],
        type: 'paragraph',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
  });

  it('migrates primary and named roots during deferred document loads', () => {
    const editor = createBaseEditor({
      editor: createEditor<Value>(),
      plugins: [
        ScriptV54MigrationPlugin,
        BaseScriptPlugin,
        TestRootPlugin,
      ] as const,
      skipInitialization: true,
    });

    editor.update.value.replace({
      children: [
        {
          childRoots: { testRoot: 'notes' },
          children: [{ text: '' }],
          type: 'testRoot',
        },
        {
          children: [{ subscript: true, text: 'main' }],
          type: 'paragraph',
        },
      ],
      roots: {
        notes: [
          {
            children: [{ superscript: true, text: 'root' }],
            type: 'paragraph',
          },
        ],
      },
    });

    expect(editor.read.children()[1]).toEqual({
      children: [{ script: 'sub', text: 'main' }],
      type: 'paragraph',
    });
    expect(editor.read.value().roots?.notes).toEqual([
      {
        children: [{ script: 'sup', text: 'root' }],
        type: 'paragraph',
      },
    ]);
  });

  it('rejects ambiguous legacy marks with their document path', () => {
    expect(() =>
      createBaseEditor({
        editor: createEditor<Value>(),
        plugins: [ScriptV54MigrationPlugin, BaseScriptPlugin] as const,
        initialValue: [
          {
            children: [
              {
                subscript: true,
                superscript: true,
                text: 'conflict',
              },
            ],
            type: 'paragraph',
          },
        ],
      })
    ).toThrow(/main\.0\.0 cannot be both subscript and superscript/);
  });

  it('rejects conflicts with an existing canonical mark', () => {
    expect(() =>
      createBaseEditor({
        editor: createEditor<Value>(),
        plugins: [ScriptV54MigrationPlugin, BaseScriptPlugin] as const,
        initialValue: [
          {
            children: [
              {
                script: 'sup',
                subscript: true,
                text: 'conflict',
              },
            ],
            type: 'paragraph',
          },
        ],
      })
    ).toThrow(/main\.0\.0 conflicts with script "sup"/);
  });
});
