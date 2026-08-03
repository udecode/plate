import React from 'react';

import { Plate, createPlateEditor } from '@platejs/core/react';
import type { TextSelection } from '@platejs/plite';
import { act, renderHook } from '@testing-library/react';

const selection = {
  kind: 'text',
  anchor: { offset: 0, path: [0, 0] },
  focus: { offset: 4, path: [0, 0] },
} satisfies TextSelection;
const setReference = mock();
const setFloating = mock();
const update = mock();
const useFloatingMock = mock(() => ({
  context: {},
  elements: {},
  floatingStyles: {},
  isPositioned: true,
  middlewareData: {},
  placement: 'bottom',
  refs: { setFloating, setReference },
  strategy: 'absolute',
  update,
  x: 10,
  y: 20,
}));

mock.module('./floating-ui', () => ({
  autoUpdate: mock(),
  useFloating: useFloatingMock,
}));

describe('floating hooks', () => {
  beforeEach(() => {
    setReference.mockClear();
    setFloating.mockClear();
    update.mockClear();
    useFloatingMock.mockClear();
  });

  afterAll(() => {
    mock.restore();
  });

  it('controls a virtual reference and derives its floating style', async () => {
    const { useVirtualFloating } = await import(
      `./useFloating?virtual=${Math.random().toString(36).slice(2)}`
    );
    const rect = {
      bottom: 8,
      height: 4,
      left: 2,
      right: 6,
      top: 4,
      width: 4,
      x: 2,
      y: 4,
    };
    const { result } = renderHook(() =>
      useVirtualFloating({
        getBoundingClientRect: () => rect,
        open: false,
      })
    );

    expect(setReference).toHaveBeenCalledWith(
      result.current.virtualElementRef.current
    );
    expect(
      result.current.virtualElementRef.current.getBoundingClientRect()
    ).toBe(rect);
    expect(result.current.style).toEqual({
      display: 'none',
      left: 10,
      position: 'absolute',
      top: 20,
      visibility: undefined,
    });
    expect(update).toHaveBeenCalled();
  });

  it('closes the toolbar when focus moves to another editor', async () => {
    const { useFloatingToolbar, useFloatingToolbarState } = await import(
      `./useFloating?toolbar=${Math.random().toString(36).slice(2)}`
    );
    const editor = createPlateEditor({
      id: 'editor-1',
      selection,
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );
    const { rerender, result } = renderHook(
      ({ focusedEditorId }: { focusedEditorId: string }) => {
        const state = useFloatingToolbarState({
          editorId: 'editor-1',
          focusedEditorId,
        });

        return useFloatingToolbar(state);
      },
      { initialProps: { focusedEditorId: 'editor-1' }, wrapper }
    );

    await act(async () => {});
    expect(result.current.hidden).toBe(false);

    rerender({ focusedEditorId: 'editor-2' });
    await act(async () => {});

    expect(result.current.hidden).toBe(true);
  });
});
