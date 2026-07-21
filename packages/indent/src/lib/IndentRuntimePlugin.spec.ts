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
  node: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      groups: ['block'],
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
      value,
    });

    editor.update.value.repair();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'One' }], indent: 2, type: 'p' },
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
        value,
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
