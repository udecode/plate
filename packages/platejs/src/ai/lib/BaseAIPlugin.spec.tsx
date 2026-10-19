import { describe, expect, it } from 'bun:test';

import {
  BaseParagraphPlugin,
  createEditor,
  type Descendant,
  type NodeEntry,
} from '../../core';
import { BaseAIPlugin } from './BaseAIPlugin';

describe('BaseAIPlugin', () => {
  const block = (children: Descendant[]): NodeEntry => [
    { children, type: 'paragraph' },
    [0],
  ];

  it('finds matching text across leaves', () => {
    const editor = createEditor({ plugins: [BaseAIPlugin] });

    expect(
      editor.plugin(BaseAIPlugin).api.findTextRangeInBlock({
        block: block([
          { text: 'prefix ' },
          { bold: true, text: 'te' },
          { text: 'st' },
        ]),
        findText: 'test',
      })
    ).toEqual({
      anchor: { offset: 0, path: [0, 1] },
      focus: { offset: 2, path: [0, 2] },
    });
  });

  it('uses a bounded fuzzy match', () => {
    const editor = createEditor({ plugins: [BaseAIPlugin] });

    expect(
      editor.plugin(BaseAIPlugin).api.findTextRangeInBlock({
        block: block([{ text: 'The quik brown fox' }]),
        findText: 'quick',
      })
    ).toEqual({
      anchor: { offset: 4, path: [0, 0] },
      focus: { offset: 8, path: [0, 0] },
    });
  });

  it('inserts and removes AI-marked text through transaction helpers', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin],
      selection: {
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
        kind: 'text',
      },
      initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
    });

    editor.update((tx) => tx.ai.insertNodes([{ text: ' AI' }]));

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'one' }, { ai: true, text: ' AI' }],
        type: 'paragraph',
      },
    ]);

    editor.update((tx) => tx.ai.removeMarks());

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'one AI' }],
        type: 'paragraph',
      },
    ]);
  });

  it('removes AI text without touching ordinary text', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin],
      initialValue: [
        {
          children: [
            { text: 'one' },
            { ai: true, text: ' AI' },
            { text: ' tail' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update((tx) => tx.ai.removeNodes());

    expect(editor.read.text.string([])).toBe('one tail');
  });
});
