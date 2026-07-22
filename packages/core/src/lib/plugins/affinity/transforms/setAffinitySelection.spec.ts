import { property } from '@platejs/plite';
import type { EdgeNodes } from '../types';

import { createBaseEditor } from '../../../editor';
import { createBasePlugin } from '../../../plugin';
import { setAffinitySelection } from './setAffinitySelection';

const MarkPlugins = [
  createBasePlugin({
    key: 'bold',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  }),
  createBasePlugin({
    key: 'italic',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  }),
];

const createAffinityEditor = () => {
  const editor = createBaseEditor({
    plugins: MarkPlugins,
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    initialValue: [
      {
        type: 'p',
        children: [
          { bold: true, text: 'before' },
          { italic: true, text: 'after' },
        ],
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
    setAffinitySelection(edgeNodes, affinity, tx);
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
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
      marks: {},
    });
  });

  it('moves selection to the previous text edge and inherits its marks', () => {
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
      kind: 'text',
      anchor: { offset: 6, path: [0, 0] },
      focus: { offset: 6, path: [0, 0] },
    });
    expect(editor.read.marks()).toEqual({ bold: true });
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
      kind: 'text',
      anchor: { offset: 6, path: [0, 0] },
      focus: { offset: 6, path: [0, 0] },
      marks: { italic: true },
    });
    expect(editor.read.marks()).toEqual(
      expect.objectContaining({
        italic: true,
      })
    );
  });

  it('keeps the active marks when moving forward without a previous edge node', () => {
    const editor = createAffinityEditor();

    applyAffinitySelection(
      editor,
      [null, [{ italic: true, text: 'after' }, [0, 1]]] as EdgeNodes,
      'forward'
    );

    expect(editor.read.marks()).toEqual({ bold: true });
    expect(editor.read.selection()).toEqual({
      kind: 'text',
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
      kind: 'text',
      anchor: { offset: 6, path: [0, 0] },
      focus: { offset: 6, path: [0, 0] },
    });
    expect(editor.read.marks()).toEqual({ bold: true });
  });
});
