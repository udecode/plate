import { act, renderHook } from '@testing-library/react';
import * as actualCore from '@platejs/core';
import * as actualCoreReact from '@platejs/core/react';

const useEditorMock = mock();
const useElementMock = mock();
mock.module('@platejs/core', () => ({
  ...actualCore,
  isHotkey: (hotkey: string) => (event: { key?: string }) => {
    const key = String(event.key || '').toLowerCase();

    return (
      (hotkey === 'enter' && key === 'enter') ||
      (hotkey === 'escape' && key === 'escape') ||
      (hotkey === 'ArrowLeft' && key === 'arrowleft') ||
      (hotkey === 'ArrowRight' && key === 'arrowright')
    );
  },
}));

mock.module('@platejs/core/react', () => ({
  ...actualCoreReact,
  useEditor: useEditorMock,
  useElement: useElementMock,
}));

describe('useEquationInput', () => {
  beforeEach(() => {
    useEditorMock.mockReset();
    useElementMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('updates inline equations with merging, restores dismiss state, and navigates at text edges', async () => {
    const { useEquationInput } = await import(
      `./useEquation?test=${Math.random().toString(36).slice(2)}`
    );
    const focus = mock();
    const select = mock();
    const setNodes = mock();
    const pluginUpdate = Object.assign(mock(), { set: setNodes });
    pluginUpdate.mockImplementation(() => pluginUpdate);
    const onClose = mock();
    const element = { texExpression: 'x+1', type: 'equation' };
    const beforePoint = { offset: 0, path: [0, 0] };
    const afterPoint = { offset: 0, path: [0, 2] };
    const after = mock(() => afterPoint);
    const before = mock(() => beforePoint);

    useElementMock.mockReturnValue(element);
    useEditorMock.mockReturnValue({
      api: {
        dom: { focus },
      },
      read: {
        nodes: {
          path: () => [0, 1],
        },
        points: {
          after,
          before,
        },
      },
      plugin: () => ({ update: pluginUpdate }),
      update: { selection: { set: select } },
    });

    const { result } = renderHook(() =>
      useEquationInput({ isInline: true, onClose, open: false })
    );
    const input = document.createElement('textarea');
    input.value = 'x+2';
    input.setSelectionRange(0, 0);

    act(() => {
      result.current.props.onChange({ currentTarget: input });
    });

    result.current.props.onKeyDown({
      altKey: false,
      ctrlKey: false,
      currentTarget: input,
      key: 'ArrowLeft',
      metaKey: false,
      preventDefault: mock(),
      shiftKey: false,
      which: 37,
    });

    input.setSelectionRange(input.value.length, input.value.length);
    result.current.props.onKeyDown({
      altKey: false,
      ctrlKey: false,
      currentTarget: input,
      key: 'ArrowRight',
      metaKey: false,
      preventDefault: mock(),
      shiftKey: false,
      which: 39,
    });

    act(() => result.current.onDismiss());

    expect(pluginUpdate).toHaveBeenCalledWith({ history: 'merge' });
    expect(setNodes).toHaveBeenCalledWith(
      { texExpression: 'x+2' },
      { at: [0, 1] }
    );
    expect(setNodes).toHaveBeenCalledWith(
      { texExpression: 'x+1' },
      { at: [0, 1] }
    );
    expect(before).toHaveBeenCalledWith(element);
    expect(after).toHaveBeenCalledWith(element);
    expect(select).toHaveBeenNthCalledWith(1, beforePoint);
    expect(select).toHaveBeenNthCalledWith(2, afterPoint);
    expect(focus).toHaveBeenCalledTimes(2);
    expect(onClose).toHaveBeenCalled();
  });
});
