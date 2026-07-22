import * as React from 'react';

import type { EditorUpdateTransaction, Point } from '@platejs/plite';
import { render } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const pointAnchorReleaseMock = mock();
const insertTextMock = mock();
const useComboboxInputMock = mock();
const useEditorMock = mock();
const usePathMock = mock();

const store = {
  first: () => null,
  getState: () => ({ activeId: null }),
  last: () => null,
  setActiveId: mock(),
  useState: (key: string) => {
    if (key === 'items') return [];
    if (key === 'value') return '';

    return null;
  },
};

let pointAnchorValue: Point | null;
let pointAnchor: {
  release: typeof pointAnchorReleaseMock;
  resolve: () => Point | null;
};
let capturedCancelInput:
  | ((cause: 'arrowLeft' | 'arrowRight' | 'blur' | 'backspace') => void)
  | undefined;

mock.module('@ariakit/react', () => ({
  Combobox: (props: any) => <input {...props} />,
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

mock.module('@platejs/combobox/react', () => ({
  useComboboxInput: useComboboxInputMock,
  useHTMLInputCursorState: () => ({ atEnd: true, atStart: true }),
}));

mock.module('class-variance-authority', () => ({
  cva: () => () => '',
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
  usePath: usePathMock,
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

describe('InlineCombobox', () => {
  beforeEach(() => {
    capturedCancelInput = undefined;
    insertTextMock.mockReset();
    pointAnchorReleaseMock.mockReset();
    useComboboxInputMock.mockReset();
    useEditorMock.mockReset();
    usePathMock.mockReset();
    store.setActiveId.mockReset();

    pointAnchorValue = { offset: 1, path: [0, 0] };
    pointAnchor = {
      release: pointAnchorReleaseMock,
      resolve: () => pointAnchorValue,
    };

    useComboboxInputMock.mockImplementation(({ onCancelInput }: any) => {
      capturedCancelInput = onCancelInput;

      return {
        props: {},
        removeInput: mock(),
      };
    });

    usePathMock.mockReturnValue([0]);
    useEditorMock.mockReturnValue({
      anchor: () => pointAnchor,
      read: {
        points: {
          before: () => ({ offset: 1, path: [0, 0] }),
        },
      },
      runtime: {},
      update: (callback: (tx: EditorUpdateTransaction) => void) => {
        callback({
          selection: { move: mock() },
          text: { insert: insertTextMock },
        } as unknown as EditorUpdateTransaction);
      },
    });
  });

  afterAll(() => {
    mock.restore();
  });

  it('uses the live point anchor value when canceling input', async () => {
    const { InlineCombobox } = await import(
      `./inline-combobox?test=${Math.random().toString(36).slice(2)}`
    );

    render(
      <InlineCombobox
        element={{ children: [{ text: '' }], type: 'mention_input' }}
        trigger="@"
      >
        <div>child</div>
      </InlineCombobox>
    );

    pointAnchorValue = { offset: 4, path: [0, 2] };
    capturedCancelInput?.('blur');

    expect(insertTextMock).toHaveBeenCalledWith('@', {
      at: { offset: 4, path: [0, 2] },
    });
  });
});
