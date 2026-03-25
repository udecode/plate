import { act, renderHook } from '@testing-library/react';
import * as actualPlatejs from 'platejs';
import * as actualPlatejsReact from 'platejs/react';

const useEditorRefMock = mock();
const useElementMock = mock();
const getEditorPluginMock = mock();
const useEditorPluginMock = mock();
const useEditorSelectorMock = mock();
const usePluginOptionMock = mock();
const useReadOnlyMock = mock();
const useSelectedMock = mock();

mock.module('platejs', () => ({
  ...actualPlatejs,
  Hotkeys: {
    isRedo: () => false,
    isUndo: () => false,
  },
  KEYS: {
    ...actualPlatejs.KEYS,
    link: 'link',
    toggle: 'toggle',
    ulClassic: 'ulClassic',
  },
  getEditorPlugin: getEditorPluginMock,
  isHotkey: (hotkey: string) => (event: any) => {
    const key = String(event.key || '').toLowerCase();

    return (
      (hotkey === 'enter' && key === 'enter') ||
      (hotkey === 'escape' && key === 'escape') ||
      (hotkey === 'ArrowLeft' && key === 'arrowleft') ||
      (hotkey === 'ArrowRight' && key === 'arrowright')
    );
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

describe('useEquationInput', () => {
  beforeEach(() => {
    useEditorRefMock.mockReset();
    useElementMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('updates inline equations with merging, restores dismiss state, and navigates at text edges', async () => {
    const { useEquationInput } = await import(
      `./useEquationInput?test=${Math.random().toString(36).slice(2)}`
    );
    const select = mock();
    const setNodes = mock();
    const withMerging = mock((fn: Function) => fn());
    const onClose = mock();

    useElementMock.mockReturnValue({ texExpression: 'x+1', type: 'equation' });
    useEditorRefMock.mockReturnValue({
      tf: { select, setNodes, withMerging },
    });

    const { result } = renderHook(() =>
      useEquationInput({ isInline: true, onClose, open: false })
    );

    act(() => {
      result.current.props.onChange({
        target: { value: 'x+2' },
      } as any);
    });

    result.current.props.onKeyDown({
      key: 'ArrowLeft',
      preventDefault: mock(),
      target: { selectionEnd: 0, selectionStart: 0, value: 'x+2' },
    } as any);

    result.current.onDismiss();

    expect(withMerging).toHaveBeenCalled();
    expect(setNodes).toHaveBeenCalledWith(
      { texExpression: 'x+2' },
      { at: { texExpression: 'x+1', type: 'equation' } }
    );
    expect(select).toHaveBeenCalledWith(
      { texExpression: 'x+1', type: 'equation' },
      { focus: true, previous: true }
    );
    expect(onClose).toHaveBeenCalled();
  });
});
