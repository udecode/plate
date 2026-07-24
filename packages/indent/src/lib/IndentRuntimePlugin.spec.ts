import { BaseParagraphPlugin, createBasePlugin } from '@platejs/core';
import {
  EditorSchemaValidationError,
  schema,
  type Value,
} from '@platejs/plite';
import { createPlateEditor } from '@platejs/core/react';

import { BaseIndentPlugin } from './BaseIndentPlugin';

const QuotePlugin = createBasePlugin({
  key: 'quote',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
});

describe('BaseIndentPlugin Plite runtime', () => {
  it('caps matching block indent during normalization', () => {
    const value: Value = [
      { children: [{ text: 'One' }], indent: 4, type: 'p' },
    ];

    const editor = createPlateEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseIndentPlugin.configure({
          options: { indentMax: 2 },
        }),
      ],
      initialValue: value,
    });

    editor.update.value.repair();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'One' }], indent: 2, type: 'p' },
    ]);
  });

  it('caps the resolved schema property instead of an injected node key', () => {
    const value: Value = [{ children: [{ text: 'One' }], depth: 4, type: 'p' }];

    const editor = createPlateEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseIndentPlugin.configure({
          inject: {
            nodeProps: {
              nodeKey: 'legacyIndent',
            },
          },
          options: { indentMax: 2 },
          type: 'depth',
        }),
      ],
      initialValue: value,
    });

    editor.update.value.repair();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'One' }], depth: 2, type: 'p' },
    ]);
  });

  it('rejects indent outside the configured target types', () => {
    const value: Value = [
      { children: [{ text: 'One' }], indent: 2, type: 'quote' },
    ];

    let thrown: unknown;

    try {
      createPlateEditor({
        plugins: [BaseParagraphPlugin, QuotePlugin, BaseIndentPlugin],
        initialValue: value,
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(EditorSchemaValidationError);
    if (!(thrown instanceof EditorSchemaValidationError)) throw thrown;
    expect(thrown.diagnostics).toMatchObject([
      {
        code: 'property-target-mismatch',
        nodeType: 'quote',
        property: { key: 'indent' },
      },
    ]);
  });
});
