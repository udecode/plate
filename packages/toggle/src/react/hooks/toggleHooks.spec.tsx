import { renderHook } from '@testing-library/react';
import * as actualPlatejs from 'platejs';
import * as actualPlatejsReact from 'platejs/react';

const useEditorPluginMock = mock();
const useEditorRefMock = mock();
const useEditorSelectorMock = mock();
const usePluginOptionMock = mock();
const someToggleMock = mock();
const openNextTogglesMock = mock();

mock.module('../../lib', () => ({
  BaseTogglePlugin: { key: 'baseToggle' },
  someToggle: someToggleMock,
}));

mock.module('../transforms', () => ({
  openNextToggles: openNextTogglesMock,
}));

mock.module('platejs', () => ({
  ...actualPlatejs,
  KEYS: {
    ...actualPlatejs.KEYS,
    toggle: 'toggle',
  },
}));

mock.module('platejs/react', () => ({
  ...actualPlatejsReact,
  useEditorPlugin: useEditorPluginMock,
  useEditorRef: useEditorRefMock,
  useEditorSelector: useEditorSelectorMock,
  usePluginOption: usePluginOptionMock,
}));

describe('toggle hooks', () => {
  beforeEach(() => {
    useEditorPluginMock.mockReset();
    useEditorRefMock.mockReset();
    useEditorSelectorMock.mockReset();
    usePluginOptionMock.mockReset();
    someToggleMock.mockReset();
    openNextTogglesMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('builds toolbar button props that open toggles and toggle the block', async () => {
    const { useToggleToolbarButton, useToggleToolbarButtonState } =
      await import(
        `./useToggleToolbarButton?test=${Math.random().toString(36).slice(2)}`
      );
    const toggleBlock = mock();
    const collapse = mock();
    const focus = mock();
    const editor = {
      tf: { collapse, focus, toggleBlock },
    } as any;

    someToggleMock.mockReturnValue(true);
    useEditorSelectorMock.mockImplementation((selector: any) => selector({}));
    useEditorRefMock.mockReturnValue(editor);

    const { result } = renderHook(() => {
      const state = useToggleToolbarButtonState();

      return useToggleToolbarButton(state);
    });

    result.current.props.onClick();

    expect(result.current.props.pressed).toBe(true);
    expect(openNextTogglesMock).toHaveBeenCalledWith(editor);
    expect(toggleBlock).toHaveBeenCalledWith('toggle');
    expect(collapse).toHaveBeenCalled();
    expect(focus).toHaveBeenCalled();
  });

  it('builds toggle button state from open ids and toggles the clicked id', async () => {
    const { useToggleButton, useToggleButtonState } = await import(
      `./useToggleButton?test=${Math.random().toString(36).slice(2)}`
    );
    const toggleIds = mock();

    usePluginOptionMock.mockReturnValue(new Set(['t1']));
    useEditorPluginMock.mockReturnValue({
      api: {
        toggle: { toggleIds },
      },
    });

    const { result } = renderHook(() => {
      const state = useToggleButtonState('t1');

      return useToggleButton(state);
    });

    result.current.buttonProps.onClick({ preventDefault: mock() } as any);

    expect(result.current.open).toBe(true);
    expect(toggleIds).toHaveBeenCalledWith(['t1']);
  });
});
