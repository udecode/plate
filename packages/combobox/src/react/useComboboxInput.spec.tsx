import { act, renderHook } from '@testing-library/react';
import type React from 'react';

import * as actualCoreReact from '@platejs/core/react';
import { type Element, ElementApi } from '@platejs/plite';

const useEditorMock = mock();
const useElementMock = mock();
const useElementSelectedMock = mock();

mock.module('@platejs/core/react', () => ({
  ...actualCoreReact,
  useEditor: useEditorMock,
  useElement: useElementMock,
  useElementSelected: useElementSelectedMock,
}));

const ComboboxInputPlugin = actualCoreReact.createPlatePlugin({
  name: 'mentionInput',
  schema: {
    element: {
      inline: true,
      void: 'inline',
    },
  },
  type: 'mention_input',
});

describe('combobox input hooks', () => {
  beforeEach(() => {
    useEditorMock.mockReset();
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
      plugins: [ComboboxInputPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 1, 0] },
        focus: { offset: 0, path: [0, 1, 0] },
      },
      initialValue: [
        { children: [inputElement], type: 'p' },
        { children: [{ text: 'after' }], type: 'p' },
      ],
    });
    const element = editor.read.nodes.get<Element>([0, 1])?.[0];

    if (!element || !ElementApi.isElement(element)) {
      throw new TypeError('Expected a live combobox input element');
    }

    useElementSelectedMock.mockReturnValue(true);
    useEditorMock.mockReturnValue(editor);
    useElementMock.mockReturnValue(element);

    const ref = { current: document.createElement('input') };
    const { result } = renderHook(() =>
      useComboboxInput({
        cursorState: { atEnd: true, atStart: true },
        onCancelInput,
        ref,
      })
    );

    result.current.props.onBlur();

    expect(editor.read.children()).toHaveLength(2);
    expect(editor.read.text.string([0])).toBe('');
    expect(editor.read.text.string([1])).toBe('after');
    expect(editor.read.nodes.some({ match: { type: 'mention_input' } })).toBe(
      false
    );
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
      plugins: [ComboboxInputPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 1, 0] },
        focus: { offset: 0, path: [0, 1, 0] },
      },
      initialValue: [
        {
          children: [{ children: [{ text: '' }], type: 'mention_input' }],
          type: 'p',
        },
        { children: [{ text: 'after' }], type: 'p' },
      ],
    });
    const element = editor.read.nodes.get<Element>([0, 1])?.[0];

    if (!element || !ElementApi.isElement(element)) {
      throw new TypeError('Expected a live combobox input element');
    }

    useElementSelectedMock.mockReturnValue(true);
    useEditorMock.mockReturnValue(editor);
    useElementMock.mockReturnValue(element);

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

    expect(editor.read.children()).toHaveLength(2);
    expect(editor.read.text.string([0])).toBe('');
    expect(editor.read.text.string([1])).toBe('after');
    expect(editor.read.nodes.some({ match: { type: 'mention_input' } })).toBe(
      false
    );
    expect(onCancelInput).toHaveBeenCalledWith(cause);
  });

  it('forwards undo and redo to the editor history', async () => {
    const { useComboboxInput } = await import(
      `./useComboboxInput?test=${Math.random().toString(36).slice(2)}`
    );
    const editor = actualCoreReact.createPlateEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'a' }], type: 'p' }],
    });
    const element = editor.read.children()[0];

    if (!ElementApi.isElement(element)) {
      throw new TypeError('Expected a live paragraph element');
    }

    editor.update.text.insert('b');
    useElementSelectedMock.mockReturnValue(true);
    useEditorMock.mockReturnValue(editor);
    useElementMock.mockReturnValue(element);

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
      `./useComboboxInput?test=${Math.random().toString(36).slice(2)}`
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
