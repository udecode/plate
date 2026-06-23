import { createSlateEditor, KEYS } from 'platejs';

import { getCurrentRuntimeTransforms } from '../../../core/src/internal/currentRuntimeBridge';
import { createPlateRuntimeEditor } from '../../../core/src/react/editor/createPlateRuntimeEditor';
import { BaseTocPlugin } from './BaseTocPlugin';

describe('BaseTocPlugin', () => {
  const createTocRuntimeEditor = ({
    selection,
    value,
  }: {
    selection: {
      anchor: { offset: number; path: number[] };
      focus: { offset: number; path: number[] };
    };
    value: { children: { text: string }[]; type: string }[];
  }) =>
    createPlateRuntimeEditor({
      initialSelection: selection,
      initialValue: value,
      plugins: [BaseTocPlugin],
    });

  const root = (editor: ReturnType<typeof createTocRuntimeEditor>) =>
    editor.read((state) => state.value.root());

  const selection = (editor: ReturnType<typeof createTocRuntimeEditor>) =>
    editor.read((state) => state.selection.get());

  it('configures toc as a void element with the shipped defaults', () => {
    const editor = createSlateEditor({
      plugins: [BaseTocPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseTocPlugin);

    expect(plugin.key).toBe(KEYS.toc);
    expect(plugin.node).toMatchObject({
      isElement: true,
      isVoid: true,
    });
    expect(plugin.options).toMatchObject({
      isScroll: true,
      topOffset: 80,
    });
  });

  it('deleteForward removes the selected toc block', () => {
    const editor = createTocRuntimeEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: '' }],
          type: KEYS.toc,
        },
        {
          children: [{ text: 'after' }],
          type: KEYS.p,
        },
      ],
    });

    getCurrentRuntimeTransforms(editor).deleteForward('character');

    expect(root(editor)).toMatchObject([
      {
        children: [{ text: 'after' }],
        type: KEYS.p,
      },
    ]);
    expect(selection(editor)).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('deleteBackward from the next block selects the toc instead of deleting through it', () => {
    const editor = createTocRuntimeEditor({
      selection: {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      value: [
        {
          children: [{ text: '' }],
          type: KEYS.toc,
        },
        {
          children: [{ text: 'after' }],
          type: KEYS.p,
        },
      ],
    });

    getCurrentRuntimeTransforms(editor).deleteBackward('character');

    expect(root(editor)).toHaveLength(2);
    expect(selection(editor)).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('moveLine from the next block selects the toc instead of entering its empty child', () => {
    const editor = createTocRuntimeEditor({
      selection: {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      value: [
        {
          children: [{ text: '' }],
          type: KEYS.toc,
        },
        {
          children: [{ text: 'after' }],
          type: KEYS.p,
        },
      ],
    });

    getCurrentRuntimeTransforms(editor).move({ reverse: true, unit: 'line' });

    expect(selection(editor)).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('keeps Enter on the toc selection from creating text inside the toc', () => {
    const editor = createTocRuntimeEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: '' }],
          type: KEYS.toc,
        },
        {
          children: [{ text: 'after' }],
          type: KEYS.p,
        },
      ],
    });

    getCurrentRuntimeTransforms(editor).insertBreak();

    expect(root(editor)).toEqual([
      {
        children: [{ text: '' }],
        type: KEYS.toc,
      },
      {
        children: [{ text: 'after' }],
        type: KEYS.p,
      },
    ]);
    expect(selection(editor)).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('lets Tab fall through instead of tabbing into toc text', () => {
    const editor = createTocRuntimeEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: '' }],
          type: KEYS.toc,
        },
        {
          children: [{ text: 'after' }],
          type: KEYS.p,
        },
      ],
    });

    expect(getCurrentRuntimeTransforms(editor).tab({ reverse: false })).toBe(
      false
    );
    expect(selection(editor)).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });
});
