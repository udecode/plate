import { act, renderHook } from '@testing-library/react';
import * as actualPlatejs from 'platejs';
import * as actualPlatejsReact from 'platejs/react';

const useEditorRefMock = mock();
const useElementMock = mock();
const useSelectedMock = mock();
const getEditorPluginMock = mock();
const useEditorPluginMock = mock();
const useEditorSelectorMock = mock();
const usePluginOptionMock = mock();
const useReadOnlyMock = mock();

mock.module('platejs', () => ({
  ...actualPlatejs,
  Hotkeys: {
    isRedo: (event: any) => event.key === 'y' && event.metaKey,
    isUndo: (event: any) => event.key === 'z' && event.metaKey,
  },
  KEYS: {
    ...actualPlatejs.KEYS,
    link: 'link',
    toggle: 'toggle',
    ulClassic: 'ulClassic',
  },
  getEditorPlugin: getEditorPluginMock,
  isHotkey: (hotkey: string, event?: any) => (eventArg?: any) => {
    const e = eventArg ?? event;
    const key = String(e.key || '').toLowerCase();
    const map: Record<string, string> = {
      arrowleft: 'arrowleft',
      arrowright: 'arrowright',
      backspace: 'backspace',
      escape: 'escape',
    };

    return key === map[hotkey];
  },
}));

mock.module('platejs/react', () => ({
  ...actualPlatejsReact,
  useEditorPlugin: useEditorPluginMock,
  useEditorRef: useEditorRefMock,
  useEditorSelector: useEditorSelectorMock,
  useElement: useElementMock,
  usePluginOption: usePluginOptionMock,
  useReadOnly: useReadOnlyMock,
  useSelected: useSelectedMock,
}));

describe('combobox input hooks', () => {
  beforeEach(() => {
    useEditorRefMock.mockReset();
    useElementMock.mockReset();
    useSelectedMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('cancels input from keyboard edges, blur, and forwards undo/redo to the editor', async () => {
    const { useComboboxInput } = await import(
      `./useComboboxInput?test=${Math.random().toString(36).slice(2)}`
    );
    const focus = mock();
    const redo = mock();
    const removeNodes = mock();
    const undo = mock();
    const onCancelInput = mock();

    useElementMock.mockReturnValue({ id: 'el' });
    useSelectedMock.mockReturnValue(true);
    useEditorRefMock.mockReturnValue({
      api: {
        findPath: () => [0],
      },
      history: {
        redos: [{}],
        undos: [{}],
      },
      redo,
      tf: {
        focus,
        removeNodes,
      },
      undo,
    });

    const ref = { current: { focus: mock() } } as any;
    const { result } = renderHook(() =>
      useComboboxInput({
        cursorState: { atEnd: true, atStart: true },
        onCancelInput,
        ref,
      })
    );

    result.current.props.onBlur();
    result.current.props.onKeyDown({
      key: 'Escape',
      preventDefault: mock(),
    } as any);
    result.current.props.onKeyDown({
      key: 'z',
      metaKey: true,
      preventDefault: mock(),
    } as any);

    expect(removeNodes).toHaveBeenCalled();
    expect(onCancelInput).toHaveBeenCalledWith('blur');
    expect(onCancelInput).toHaveBeenCalledWith('escape');
    expect(undo).toHaveBeenCalled();
    expect(focus).toHaveBeenCalled();
  });

  it('tracks html input cursor edges from DOM selection changes', async () => {
    const { useHTMLInputCursorState } = await import(
      `./useHTMLInputCursorState?test=${Math.random().toString(36).slice(2)}`
    );
    const timers: Function[] = [];
    const setTimeoutSpy = spyOn(globalThis, 'setTimeout').mockImplementation(((
      fn: Function
    ) => {
      timers.push(fn);
      return 1;
    }) as any);

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
