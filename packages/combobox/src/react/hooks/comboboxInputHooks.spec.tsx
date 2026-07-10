import { act, renderHook } from '@testing-library/react';
import type React from 'react';

import * as actualCoreReact from '@platejs/core/react';
import { type Element, ElementApi } from '@platejs/plite';

const useEditorRefMock = mock();
const useElementMock = mock();
const useElementSelectedMock = mock();

mock.module('@platejs/core/react', () => ({
  ...actualCoreReact,
  useEditorRef: useEditorRefMock,
  useElement: useElementMock,
  useElementSelected: useElementSelectedMock,
}));

describe('combobox input hooks', () => {
  beforeEach(() => {
    useEditorRefMock.mockReset();
    useElementMock.mockReset();
    useElementSelectedMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('cancels input on blur', async () => {
    const { useComboboxInput } = await import(
      `./useComboboxInput?test=${Math.random().toString(36).slice(2)}`
    );
    const onCancelInput = mock();
    const inputElement = {
      children: [{ text: '' }],
      type: 'mention_input',
    } satisfies Element;
    const editor = actualCoreReact.createPlateEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [inputElement, { children: [{ text: 'after' }], type: 'p' }],
    });
    const element = editor.read.children()[0];

    if (!ElementApi.isElement(element)) {
      throw new TypeError('Expected a live combobox input element');
    }

    useElementMock.mockReturnValue(element);
    useElementSelectedMock.mockReturnValue(true);
    useEditorRefMock.mockReturnValue(editor);

    const ref = { current: document.createElement('input') };
    const { result } = renderHook(() =>
      useComboboxInput({
        cursorState: { atEnd: true, atStart: true },
        onCancelInput,
        ref,
      })
    );

    result.current.props.onBlur();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'after' }], type: 'p' },
    ]);
    expect(onCancelInput).toHaveBeenCalledWith('blur');
  });

  it.each([
    ['ArrowLeft', 37, 'arrowLeft'],
    ['ArrowRight', 39, 'arrowRight'],
    ['Backspace', 8, 'backspace'],
    ['Escape', 27, 'escape'],
  ] as const)('cancels input on %s', async (key, which, cause) => {
    const { useComboboxInput } = await import(
      `./useComboboxInput?test=${Math.random().toString(36).slice(2)}`
    );
    const onCancelInput = mock();
    const editor = actualCoreReact.createPlateEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [
        { children: [{ text: '' }], type: 'mention_input' },
        { children: [{ text: 'after' }], type: 'p' },
      ],
    });
    const element = editor.read.children()[0];

    if (!ElementApi.isElement(element)) {
      throw new TypeError('Expected a live combobox input element');
    }

    useElementMock.mockReturnValue(element);
    useElementSelectedMock.mockReturnValue(true);
    useEditorRefMock.mockReturnValue(editor);

    const { result } = renderHook(() =>
      useComboboxInput({
        cursorState: { atEnd: true, atStart: true },
        onCancelInput,
        ref: { current: document.createElement('input') },
      })
    );

    result.current.props.onKeyDown({
      key,
      preventDefault: mock(),
      which,
    } as unknown as React.KeyboardEvent<HTMLElement>);

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'after' }], type: 'p' },
    ]);
    expect(onCancelInput).toHaveBeenCalledWith(cause);
  });

  it('forwards undo and redo to the editor history', async () => {
    const { useComboboxInput } = await import(
      `./useComboboxInput?test=${Math.random().toString(36).slice(2)}`
    );
    const editor = actualCoreReact.createPlateEditor({
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [{ children: [{ text: 'a' }], type: 'p' }],
    });
    const element = editor.read.children()[0];

    if (!ElementApi.isElement(element)) {
      throw new TypeError('Expected a live paragraph element');
    }

    editor.update.text.insert('b');
    useElementMock.mockReturnValue(element);
    useElementSelectedMock.mockReturnValue(true);
    useEditorRefMock.mockReturnValue(editor);

    const { result } = renderHook(() =>
      useComboboxInput({
        ref: { current: document.createElement('input') },
      })
    );
    const preventDefault = mock();

    result.current.props.onKeyDown({
      ctrlKey: true,
      key: 'z',
      preventDefault,
    } as unknown as React.KeyboardEvent<HTMLElement>);

    expect(editor.read.text.string([])).toBe('a');
    expect(preventDefault).toHaveBeenCalled();

    result.current.props.onKeyDown({
      ctrlKey: true,
      key: 'z',
      preventDefault,
      shiftKey: true,
    } as unknown as React.KeyboardEvent<HTMLElement>);

    expect(editor.read.text.string([])).toBe('ab');
  });

  it('tracks html input cursor edges from DOM selection changes', async () => {
    const { useHTMLInputCursorState } = await import(
      `./useHTMLInputCursorState?test=${Math.random().toString(36).slice(2)}`
    );
    const timers: Array<() => void> = [];
    const setTimeoutSpy = spyOn(globalThis, 'setTimeout').mockImplementation(((
      fn: () => void
    ) => {
      timers.push(fn);
      return 1;
    }) as typeof setTimeout);

    const input = document.createElement('input');
    input.value = 'abc';
    input.selectionStart = 0;
    input.selectionEnd = 3;

    const { result } = renderHook(() =>
      useHTMLInputCursorState({ current: input })
    );

    act(() => {
      timers.splice(0).forEach((fn) => {
        fn();
      });
    });

    expect(result.current).toEqual({ atEnd: true, atStart: true });
    setTimeoutSpy.mockRestore();
  });
});
