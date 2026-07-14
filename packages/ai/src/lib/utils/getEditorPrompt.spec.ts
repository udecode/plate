import { BlockSelectionPlugin } from '@platejs/selection/react';
import { BaseParagraphPlugin } from '@platejs/core';
import { type Value } from '@platejs/plite';
import { createPlateEditor } from '@platejs/core/react';

import { getEditorPrompt } from './getEditorPrompt';

const createEditor = () =>
  createPlateEditor<Value>({
    plugins: [BaseParagraphPlugin, BlockSelectionPlugin],
    selection: {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    },
    value: [{ children: [{ text: 'text' }], id: 'block', type: 'p' }],
  });

describe('getEditorPrompt', () => {
  it('returns plain string prompts unchanged', () => {
    const editor = createEditor();

    expect(getEditorPrompt(editor, { prompt: 'Refine this block' })).toBe(
      'Refine this block'
    );
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

    expect(getEditorPrompt(editor, { prompt })).toBe(
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
      getEditorPrompt(editor, {
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
      getEditorPrompt(editor, {
        prompt: {
          default: 'default prompt',
        },
      })
    ).toBe('default prompt');
  });
});
