import * as React from 'react';

import type { EditorUpdateTransaction, Point } from '@platejs/plite';
import { fireEvent, render } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const pointAnchorReleaseMock = mock();
const insertTextMock = mock();
const removeNodeMock = mock();
const useEditorMock = mock();
const useElementMock = mock();
const useElementSelectedMock = mock();
const usePathMock = mock();
let comboboxValue = '';

const store = {
  first: () => null,
  getState: () => ({ activeId: null }),
  last: () => null,
  setActiveId: mock(),
  useState: (key: string) => {
    if (key === 'items') return [];
    if (key === 'value') return comboboxValue;

    return null;
  },
};

let pointAnchorValue: Point | null;
let pointAnchor: {
  release: typeof pointAnchorReleaseMock;
  resolve: () => Point | null;
};
const comboboxElement = {
  children: [{ text: '' }],
  type: 'mentionInput',
};
mock.module('@ariakit/react', () => ({
  Combobox: ({ autoSelect: _autoSelect, ...props }: any) => (
    <input {...props} readOnly />
  ),
  ComboboxGroup: ({ children }: any) => <div>{children}</div>,
  ComboboxGroupLabel: ({ children }: any) => <div>{children}</div>,
  ComboboxItem: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props} type="button">
      {children}
    </button>
  ),
  ComboboxPopover: ({ children }: any) => <div>{children}</div>,
  ComboboxProvider: ({ children }: any) => <>{children}</>,
  ComboboxRow: ({ children }: any) => <div>{children}</div>,
  Portal: ({ children }: any) => <>{children}</>,
  useComboboxContext: () => store,
  useComboboxStore: () => store,
}));

mock.module('@platejs/combobox', () => ({
  filterWords: () => true,
}));

mock.module('class-variance-authority', () => ({
  cva: () => () => '',
}));

mock.module('platejs', () => ({
  Hotkeys: {
    isRedo: () => false,
    isUndo: () => false,
  },
  isHotkey: (hotkey: string) => (event: KeyboardEvent) =>
    event.key.toLowerCase() === hotkey.toLowerCase(),
}));

mock.module('platejs/react', () => ({
  useComposedRef:
    (...refs: any[]) =>
    (value: any) => {
      refs.forEach((ref) => {
        if (!ref) return;
        if (typeof ref === 'function') {
          ref(value);
          return;
        }
        ref.current = value;
      });
    },
  useEditor: useEditorMock,
  useElement: useElementMock,
  useElementSelected: useElementSelectedMock,
  usePath: usePathMock,
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

describe('InlineCombobox', () => {
  beforeEach(() => {
    comboboxValue = '';
    insertTextMock.mockReset();
    pointAnchorReleaseMock.mockReset();
    removeNodeMock.mockReset();
    useEditorMock.mockReset();
    useElementMock.mockReset();
    useElementSelectedMock.mockReset();
    usePathMock.mockReset();
    store.setActiveId.mockReset();

    pointAnchorValue = { offset: 1, path: [0, 0] };
    pointAnchor = {
      release: pointAnchorReleaseMock,
      resolve: () => pointAnchorValue,
    };

    usePathMock.mockReturnValue([0]);
    useElementSelectedMock.mockReturnValue(true);
    const update = (callback: (tx: EditorUpdateTransaction) => void) => {
      callback({
        selection: { move: mock() },
        text: { insert: insertTextMock },
      } as unknown as EditorUpdateTransaction);
    };

    Object.assign(update, {
      history: { redo: mock(), undo: mock() },
      nodes: { remove: removeNodeMock },
    });
    useElementMock.mockReturnValue(comboboxElement);
    useEditorMock.mockReturnValue({
      anchor: () => pointAnchor,
      api: { dom: { focus: mock() } },
      read: {
        history: { redos: () => [], undos: () => [] },
        points: {
          before: () => ({ offset: 1, path: [0, 0] }),
        },
      },
      runtime: {},
      update,
    });
  });

  afterAll(() => {
    mock.restore();
  });

  it('uses the live point anchor value when canceling input', async () => {
    const { InlineCombobox, InlineComboboxInput } = await import(
      `./inline-combobox?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <InlineCombobox element={comboboxElement} trigger="@">
        <InlineComboboxInput aria-label="combobox input" />
      </InlineCombobox>
    );

    pointAnchorValue = { offset: 4, path: [0, 2] };
    fireEvent.blur(view.getByLabelText('combobox input'));

    expect(removeNodeMock).toHaveBeenCalledWith({ at: comboboxElement });
    expect(insertTextMock).toHaveBeenCalledWith('@', {
      at: { offset: 4, path: [0, 2] },
    });
  });

  it('does not cancel again through blur after keyboard removal', async () => {
    const { InlineCombobox, InlineComboboxInput } = await import(
      `./inline-combobox?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <InlineCombobox element={comboboxElement} trigger="@">
        <InlineComboboxInput aria-label="combobox input" />
      </InlineCombobox>
    );
    const input = view.getByLabelText('combobox input');
    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Backspace',
    });

    input.dispatchEvent(event);
    fireEvent.blur(input);

    expect(event.defaultPrevented).toBe(true);
    expect(removeNodeMock).toHaveBeenCalledTimes(1);
    expect(insertTextMock).not.toHaveBeenCalled();
  });

  it('keeps selected query text editable at input boundaries', async () => {
    comboboxValue = 'query';
    const { InlineCombobox, InlineComboboxInput } = await import(
      `./inline-combobox?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <InlineCombobox element={comboboxElement} trigger="@">
        <InlineComboboxInput aria-label="combobox input" />
      </InlineCombobox>
    );
    const input = view.getByLabelText('combobox input') as HTMLInputElement;

    input.setSelectionRange(0, comboboxValue.length);

    expect(fireEvent.keyDown(input, { key: 'Backspace' })).toBe(true);
    expect(removeNodeMock).not.toHaveBeenCalled();
  });
});
