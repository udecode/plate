import React from 'react';

import { act, renderHook } from '@testing-library/react';

const selection = {
  kind: 'text',
  anchor: { offset: 0, path: [0, 0] },
  focus: { offset: 4, path: [0, 0] },
};
const editor = {
  read: {
    lastCommit: () => null,
    selection: Object.assign(() => selection, {
      isExpanded: () => true,
    }),
    text: { string: () => 'text' },
  },
};
const updateMock = mock();

mock.module('@platejs/core/react', () => ({
  useEditor: () => editor,
  useEditorSelector: <T,>(selector: (currentEditor: typeof editor) => T): T =>
    selector(editor),
}));

mock.module('@platejs/plite-react', () => ({
  useEditorFocused: () => true,
  useEditorReadOnly: () => false,
}));

mock.module('@udecode/react-utils', () => ({
  useOnClickOutside: () => React.createRef<HTMLElement>(),
}));

mock.module('@udecode/utils', () => ({
  mergeProps: <T,>(defaults: T): T => defaults,
}));

mock.module('./useVirtualFloating', () => ({
  useVirtualFloating: () => ({
    refs: { setFloating: mock() },
    style: {},
    update: updateMock,
  }),
}));

describe('useFloatingToolbar', () => {
  afterAll(() => {
    mock.restore();
  });

  it('closes when focus moves to another editor', async () => {
    const { useFloatingToolbar, useFloatingToolbarState } = await import(
      `./useFloatingToolbar?test=${Math.random().toString(36).slice(2)}`
    );
    const { rerender, result } = renderHook(
      ({ focusedEditorId }: { focusedEditorId: string }) => {
        const state = useFloatingToolbarState({
          editorId: 'editor-1',
          focusedEditorId,
        });

        return useFloatingToolbar(state);
      },
      { initialProps: { focusedEditorId: 'editor-1' } }
    );

    await act(async () => {});
    expect(result.current.hidden).toBe(false);

    rerender({ focusedEditorId: 'editor-2' });
    await act(async () => {});

    expect(result.current.hidden).toBe(true);
  });
});
