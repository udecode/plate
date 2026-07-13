import { act, renderHook } from '@testing-library/react';
import * as actualCore from '@platejs/core';
import * as actualCoreReact from '@platejs/core/react';

const useEditorRefMock = mock();
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
  useEditorRef: useEditorRefMock,
  useElement: useElementMock,
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
    const mergeMetadata = mock();
    const select = mock();
    const setNodes = mock();
    const update = mock(
      (
        callback: (tx: {
          metadata: { merge: typeof mergeMetadata };
          nodes: { set: typeof setNodes };
          selection: { set: typeof select };
        }) => void
      ) =>
        callback({
          metadata: { merge: mergeMetadata },
          nodes: { set: setNodes },
          selection: { set: select },
        })
    );
    const onClose = mock();
    const beforePoint = { offset: 0, path: [0, 0] };
    const afterPoint = { offset: 0, path: [0, 2] };

    useElementMock.mockReturnValue({ texExpression: 'x+1', type: 'equation' });
    useEditorRefMock.mockReturnValue({
      read: {
        points: {
          after: () => afterPoint,
          before: () => beforePoint,
        },
      },
      update,
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

    expect(mergeMetadata).toHaveBeenCalledWith({
      history: { mode: 'merge' },
    });
    expect(setNodes).toHaveBeenCalledWith(
      { texExpression: 'x+2' },
      { at: { texExpression: 'x+1', type: 'equation' } }
    );
    expect(select).toHaveBeenNthCalledWith(1, beforePoint);
    expect(select).toHaveBeenNthCalledWith(2, afterPoint);
    expect(onClose).toHaveBeenCalled();
  });
});
