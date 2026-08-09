import { BlockSelectionPlugin } from '@platejs/selection/react';
import { BaseParagraphPlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';

import { AIChatPlugin } from './AIChatPlugin';

const createEditor = () =>
  createPlateEditor({
    plugins: [BaseParagraphPlugin, BlockSelectionPlugin, AIChatPlugin],
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    },
    initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
  });

describe('AIChatPlugin getPrompt', () => {
  it('returns plain string prompts unchanged', () => {
    const editor = createEditor();

    expect(
      editor.plugin(AIChatPlugin).read.prompt({ prompt: 'Refine this block' })
    ).toBe('Refine this block');
  });

  it('passes editor selection state into function prompts', () => {
    const editor = createEditor();
    const nodeKey = editor.key([0])!;
    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: new Set([nodeKey]) });
    let received: unknown;
    const prompt = ({
      isBlockSelecting,
      isSelecting,
    }: {
      isBlockSelecting: boolean;
      isSelecting: boolean;
    }) => {
      received = { editor, isBlockSelecting, isSelecting };

      return `block:${isBlockSelecting};selection:${isSelecting}`;
    };

    expect(editor.plugin(AIChatPlugin).read.prompt({ prompt })).toBe(
      'block:true;selection:true'
    );
    expect(received).toEqual({
      editor,
      isBlockSelecting: true,
      isSelecting: true,
    });
  });

  it('prefers block selection over text selection', () => {
    const editor = createEditor();
    const nodeKey = editor.key([0])!;
    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedKeys: new Set([nodeKey]) });

    expect(
      editor.plugin(AIChatPlugin).read.prompt({
        prompt: {
          blockSelecting: 'block prompt',
          default: 'default prompt',
          selecting: 'selection prompt',
        },
      })
    ).toBe('block prompt');
  });

  it('falls back to default when a matching branch is missing', () => {
    const editor = createEditor();

    expect(
      editor.plugin(AIChatPlugin).read.prompt({
        prompt: {
          default: 'default prompt',
        },
      })
    ).toBe('default prompt');
  });
});
