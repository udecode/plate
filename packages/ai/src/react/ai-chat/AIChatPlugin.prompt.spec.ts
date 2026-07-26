import { BlockSelectionPlugin } from '@platejs/selection/react';
import { BaseParagraphPlugin, NodeIdPlugin } from '@platejs/core';
import { type Value } from '@platejs/plite';
import { createPlateEditor } from '@platejs/core/react';

import { AIChatPlugin } from './AIChatPlugin';

const createEditor = () =>
  createPlateEditor<Value>({
    plugins: [
      BaseParagraphPlugin,
      NodeIdPlugin,
      BlockSelectionPlugin,
      AIChatPlugin,
    ],
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    },
    initialValue: [{ children: [{ text: 'text' }], id: 'block', type: 'p' }],
  });

describe('AIChatPlugin getPrompt', () => {
  it('returns plain string prompts unchanged', () => {
    const editor = createEditor();

    expect(
      editor.plugin(AIChatPlugin).api.getPrompt({ prompt: 'Refine this block' })
    ).toBe('Refine this block');
  });

  it('passes editor selection state into function prompts', () => {
    const editor = createEditor();
    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block']));
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

    expect(editor.plugin(AIChatPlugin).api.getPrompt({ prompt })).toBe(
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
    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block']));

    expect(
      editor.plugin(AIChatPlugin).api.getPrompt({
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
      editor.plugin(AIChatPlugin).api.getPrompt({
        prompt: {
          default: 'default prompt',
        },
      })
    ).toBe('default prompt');
  });
});
