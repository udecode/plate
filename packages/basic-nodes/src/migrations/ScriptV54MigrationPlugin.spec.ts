import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { schema, target } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseScriptPlugin } from '../lib/BaseScriptPlugin';
import { ScriptV54MigrationPlugin } from './ScriptV54MigrationPlugin';

const TestRootPlugin = createBasePlugin({
  key: 'testRoot',
  schema: ({ own, plugins, type }) => ({
    contentRoots: [
      own.contentRoot(plugins.blockContent(), {
        ownership: 'exclusive',
        target: target.types([type]),
      }),
    ],
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  }),
});

describe('ScriptV54MigrationPlugin', () => {
  it('migrates legacy marks during initialization', () => {
    const editor = createBaseEditor({
      nodeId: false,
      plugins: [ScriptV54MigrationPlugin, BaseScriptPlugin],
      initialValue: [
        {
          children: [
            { subscript: true, text: 'H' },
            { superscript: true, text: '2' },
            { subscript: false, text: 'O' },
          ],
          type: KEYS.p,
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
        type: KEYS.p,
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
      nodeId: false,
      plugins: [ScriptV54MigrationPlugin, BaseScriptPlugin, TestRootPlugin],
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
          type: KEYS.p,
        },
      ],
      roots: {
        notes: [
          {
            children: [{ superscript: true, text: 'root' }],
            type: KEYS.p,
          },
        ],
      },
    });

    expect(editor.read.children()[1]).toEqual({
      children: [{ script: 'sub', text: 'main' }],
      type: KEYS.p,
    });
    expect(editor.read.value().roots?.notes).toEqual([
      {
        children: [{ script: 'sup', text: 'root' }],
        type: KEYS.p,
      },
    ]);
  });

  it('derives the configured target property from ScriptPlugin', () => {
    const editor = createBaseEditor({
      nodeId: false,
      plugins: [
        ScriptV54MigrationPlugin,
        BaseScriptPlugin.configure({ type: 'verticalScript' }),
      ],
      initialValue: [
        {
          children: [{ subscript: true, text: 'configured' }],
          type: KEYS.p,
        },
      ],
    });

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'configured', verticalScript: 'sub' }],
        type: KEYS.p,
      },
    ]);
  });

  it('rejects ambiguous legacy marks with their document path', () => {
    expect(() =>
      createBaseEditor({
        nodeId: false,
        plugins: [ScriptV54MigrationPlugin, BaseScriptPlugin],
        initialValue: [
          {
            children: [
              {
                subscript: true,
                superscript: true,
                text: 'conflict',
              },
            ],
            type: KEYS.p,
          },
        ],
      })
    ).toThrow(/main\.0\.0 cannot be both subscript and superscript/);
  });

  it('rejects conflicts with an existing canonical mark', () => {
    expect(() =>
      createBaseEditor({
        nodeId: false,
        plugins: [ScriptV54MigrationPlugin, BaseScriptPlugin],
        initialValue: [
          {
            children: [
              {
                script: 'sup',
                subscript: true,
                text: 'conflict',
              },
            ],
            type: KEYS.p,
          },
        ],
      })
    ).toThrow(/main\.0\.0 conflicts with script "sup"/);
  });
});
