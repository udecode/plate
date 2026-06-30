import type { EdgeNodes } from '../types';

import { createBaseEditor } from '../../../editor';
import { setAffinitySelection } from './setAffinitySelection';

const createAffinityEditor = () => {
  const editor = createBaseEditor({
    selection: {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    value: [
      {
        type: 'p',
        children: [{ text: 'before' }, { text: 'after' }],
      },
    ],
  });

  editor.update((tx) => {
    tx.marks.set({ bold: true });
  });

  return editor;
};

const applyAffinitySelection = (
  editor: ReturnType<typeof createAffinityEditor>,
  edgeNodes: EdgeNodes,
  affinity: 'backward' | 'forward'
) => {
  editor.update((tx) => {
    setAffinitySelection(editor, edgeNodes, affinity, tx);
  });
};

describe('setAffinitySelection', () => {
  it('clears marks when moving backward without a previous edge node', () => {
    const editor = createAffinityEditor();

    applyAffinitySelection(
      editor,
      [null, [{ italic: true, text: 'after' }, [0, 1]]] as EdgeNodes,
      'backward'
    );

    expect(editor.read.marks()).toEqual({});
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('moves selection to the previous text edge and clears marks for backward affinity', () => {
    const editor = createAffinityEditor();

    applyAffinitySelection(
      editor,
      [
        [{ bold: true, text: 'before' }, [0, 0]],
        [{ italic: true, text: 'after' }, [0, 1]],
      ],
      'backward'
    );

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 6, path: [0, 0] },
      focus: { offset: 6, path: [0, 0] },
    });
    expect(editor.read.marks()).toEqual({});
  });

  it('copies the next text marks for forward affinity', () => {
    const editor = createAffinityEditor();

    applyAffinitySelection(
      editor,
      [
        [{ bold: true, text: 'before' }, [0, 0]],
        [{ italic: true, text: 'after' }, [0, 1]],
      ],
      'forward'
    );

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 6, path: [0, 0] },
      focus: { offset: 6, path: [0, 0] },
    });
    expect(editor.read.marks()).toEqual(
      expect.objectContaining({
        italic: true,
      })
    );
  });

  it('clears marks when moving forward without a previous edge node', () => {
    const editor = createAffinityEditor();

    applyAffinitySelection(
      editor,
      [null, [{ italic: true, text: 'after' }, [0, 1]]] as EdgeNodes,
      'forward'
    );

    expect(editor.read.marks()).toEqual({});
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('keeps the current marks when forward affinity lands before an element node', () => {
    const editor = createAffinityEditor();

    applyAffinitySelection(
      editor,
      [
        [{ bold: true, text: 'before' }, [0, 0]],
        [{ children: [{ text: '' }], type: 'mention' }, [0, 1]],
      ] as EdgeNodes,
      'forward'
    );

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 6, path: [0, 0] },
      focus: { offset: 6, path: [0, 0] },
    });
    expect(editor.read.marks()).toEqual({ bold: true });
  });
});
