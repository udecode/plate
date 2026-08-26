import { BaseParagraphPlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import { SelectionApi } from '@platejs/plite';

import { AIChatPlugin } from './AIChatPlugin';

const createEditor = () =>
  createPlateEditor({
    plugins: [BaseParagraphPlugin, AIChatPlugin],
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
    editor.update.selection.set(SelectionApi.nodes([[0]]));
    let received: unknown;

    expect(
      editor.plugin(AIChatPlugin).read.prompt({
        prompt: ({ isNodeSelecting, isSelecting }) => {
          received = { editor, isNodeSelecting, isSelecting };

          return `node:${isNodeSelecting};selection:${isSelecting}`;
        },
      })
    ).toBe('node:true;selection:true');
    expect(received).toEqual({
      editor,
      isNodeSelecting: true,
      isSelecting: true,
    });
  });

  it('prefers node selection over generic selection', () => {
    const editor = createEditor();
    editor.update.selection.set(SelectionApi.nodes([[0]]));

    expect(
      editor.plugin(AIChatPlugin).read.prompt({
        prompt: {
          default: 'default prompt',
          nodeSelecting: 'node prompt',
          selecting: 'selection prompt',
        },
      })
    ).toBe('node prompt');
  });

  it('keeps empty node selection distinct from range expansion', () => {
    const editor = createPlateEditor({
      plugins: [BaseParagraphPlugin, AIChatPlugin],
      selection: SelectionApi.nodes([[0]]),
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    let received: unknown;

    editor.plugin(AIChatPlugin).read.prompt({
      prompt: (params) => {
        received = params;

        return 'prompt';
      },
    });

    expect(received).toMatchObject({
      isNodeSelecting: true,
      isSelecting: false,
    });
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
