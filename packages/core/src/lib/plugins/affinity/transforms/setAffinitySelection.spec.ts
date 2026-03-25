import type { EdgeNodes } from '../types';

import { setAffinitySelection } from './setAffinitySelection';

const createAffinityEditor = () => {
  const onChange = mock();
  const setSelection = mock();
  const end = mock((path: number[]) => ({ offset: path.length, path }));

  return {
    editor: {
      api: {
        end,
        onChange,
      },
      marks: { bold: true },
      tf: {
        setSelection,
      },
    } as any,
    end,
    onChange,
    setSelection,
  };
};

describe('setAffinitySelection', () => {
  it('clears marks when moving backward without a previous edge node', () => {
    const { editor, onChange, setSelection } = createAffinityEditor();

    setAffinitySelection(
      editor,
      [null, [{ italic: true, text: 'after' }, [0, 1]]] as EdgeNodes,
      'backward'
    );

    expect(editor.marks).toEqual({});
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(setSelection).not.toHaveBeenCalled();
  });

  it('moves selection to the previous text edge and clears marks for backward affinity', () => {
    const { editor, onChange, setSelection } = createAffinityEditor();

    setAffinitySelection(
      editor,
      [
        [{ bold: true, text: 'before' }, [0, 0]],
        [{ italic: true, text: 'after' }, [0, 1]],
      ],
      'backward'
    );

    expect(setSelection).toHaveBeenCalledWith({
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });
    expect(editor.marks).toBeNull();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('copies the next text marks for forward affinity', () => {
    const { editor, onChange, setSelection } = createAffinityEditor();

    setAffinitySelection(
      editor,
      [
        [{ bold: true, text: 'before' }, [0, 0]],
        [{ italic: true, text: 'after' }, [0, 1]],
      ],
      'forward'
    );

    expect(setSelection).toHaveBeenCalledWith({
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });
    expect(editor.marks).toEqual(
      expect.objectContaining({
        italic: true,
      })
    );
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('clears marks when moving forward without a previous edge node', () => {
    const { editor, onChange, setSelection } = createAffinityEditor();

    setAffinitySelection(
      editor,
      [null, [{ italic: true, text: 'after' }, [0, 1]]] as EdgeNodes,
      'forward'
    );

    expect(editor.marks).toBeNull();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(setSelection).not.toHaveBeenCalled();
  });

  it('keeps the current marks when forward affinity lands before an element node', () => {
    const { editor, onChange, setSelection } = createAffinityEditor();

    setAffinitySelection(
      editor,
      [
        [{ bold: true, text: 'before' }, [0, 0]],
        [{ children: [{ text: '' }], type: 'mention' }, [0, 1]],
      ] as EdgeNodes,
      'forward'
    );

    expect(setSelection).toHaveBeenCalledWith({
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });
    expect(editor.marks).toEqual({ bold: true });
    expect(onChange).not.toHaveBeenCalled();
  });
});
