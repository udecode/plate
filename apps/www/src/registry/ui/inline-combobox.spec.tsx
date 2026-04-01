import * as React from 'react';

import { render } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const pointRefUnrefMock = mock();
const insertTextMock = mock();
const useComboboxInputMock = mock();
const useEditorRefMock = mock();

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

let pointRefCurrent: { current: any; unref: typeof pointRefUnrefMock };
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
  useEditorRef: useEditorRefMock,
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

describe('InlineCombobox', () => {
  beforeEach(() => {
    capturedCancelInput = undefined;
    insertTextMock.mockReset();
    pointRefUnrefMock.mockReset();
    useComboboxInputMock.mockReset();
    useEditorRefMock.mockReset();
    store.setActiveId.mockReset();

    pointRefCurrent = {
      current: { offset: 1, path: [0, 0] },
      unref: pointRefUnrefMock,
    };

    useComboboxInputMock.mockImplementation(({ onCancelInput }: any) => {
      capturedCancelInput = onCancelInput;

      return {
        props: {},
        removeInput: mock(),
      };
    });

    useEditorRefMock.mockReturnValue({
      api: {
        before: () => ({ offset: 1, path: [0, 0] }),
        findPath: () => [0],
        pointRef: () => pointRefCurrent,
      },
      meta: {},
      tf: {
        insertText: insertTextMock,
        move: mock(),
      },
    });
  });

  afterAll(() => {
    mock.restore();
  });

  it('uses the live point ref value when canceling input', async () => {
    const { InlineCombobox } = await import(
      `./inline-combobox?test=${Math.random().toString(36).slice(2)}`
    );

    render(
      <InlineCombobox
        element={{ children: [{ text: '' }], type: 'mention_input' } as any}
        trigger="@"
      >
        <div>child</div>
      </InlineCombobox>
    );

    pointRefCurrent.current = { offset: 4, path: [0, 2] };
    capturedCancelInput?.('blur');

    expect(insertTextMock).toHaveBeenCalledWith('@', {
      at: { offset: 4, path: [0, 2] },
    });
  });
});
