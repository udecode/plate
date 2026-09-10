import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
} from 'bun:test';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { createEditor, type Element } from 'platejs';
import { BaseComboboxPlugin } from 'platejs/combobox';
import { BaseMentionPlugin } from 'platejs/mention';
import * as React from 'react';

const useEditorMock = mock();
const focusMock = mock();
let comboboxValue = '';
const items: never[] = [];
const store = {
  first: () => null,
  getState: () => ({ activeId: null }),
  last: () => null,
  setActiveId: mock(),
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
  Portal: ({ children }: any) => <>{children}</>,
  useComboboxContext: () => store,
  useComboboxStore: () => store,
  useStoreState: (_store: typeof store, key: string) =>
    key === 'items' ? items : key === 'value' ? comboboxValue : null,
}));
mock.module('platejs/react', () => ({
  useComposedRef:
    (...refs: any[]) =>
    (value: any) =>
      refs.forEach((ref) => {
        if (!ref) return;
        if (typeof ref === 'function') ref(value);
        else ref.current = value;
      }),
  useEditor: useEditorMock,
  useElementSelected: () => true,
}));
const { InlineCombobox, InlineComboboxInput, InlineComboboxItem } =
  await import('./inline-combobox');

const setup = () => {
  const editor = createEditor({
    plugins: [BaseMentionPlugin],
    initialValue: [
      { type: 'paragraph', children: [{ text: 'Elsewhere' }] },
      { type: 'paragraph', children: [{ text: 'Before ' }] },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [1, 0], offset: 7 },
      focus: { path: [1, 0], offset: 7 },
    },
  });
  editor.update.text.insert('@');
  const element = editor.read.children()[1].children[1] as Element;
  useEditorMock.mockReturnValue({
    ...editor,
    api: { ...editor.api, dom: { ...editor.api.dom, focus: focusMock } },
  });
  return { editor, element };
};

describe('InlineCombobox', () => {
  beforeEach(() => {
    comboboxValue = '';
    focusMock.mockReset();
    useEditorMock.mockReset();
  });
  afterEach(cleanup);
  afterAll(() => mock.restore());

  it('restores the native input value at its moved location after blur', () => {
    comboboxValue = 'query';
    const { editor, element } = setup();
    const view = render(
      <InlineCombobox element={element} trigger="@">
        <InlineComboboxInput aria-label="query" />
      </InlineCombobox>
    );
    editor.update.nodes.insert(
      { type: 'paragraph', children: [{ text: 'Leading' }] },
      { at: [0] }
    );
    fireEvent.blur(view.getByLabelText('query'));
    expect(editor.read.text.string([2])).toBe('Before @query');
    expect(focusMock).not.toHaveBeenCalled();
  });

  it('does not cancel again through blur after keyboard removal', () => {
    const { editor, element } = setup();
    const view = render(
      <InlineCombobox element={element} trigger="@">
        <InlineComboboxInput aria-label="query" />
      </InlineCombobox>
    );
    const input = view.getByLabelText('query');
    const { version } = editor.read.lastCommit()!;
    expect(fireEvent.keyDown(input, { key: 'Backspace', keyCode: 8 })).toBe(
      false
    );
    fireEvent.blur(input);
    expect(editor.read.lastCommit()!.version - version).toBe(1);
    expect(editor.read.text.string([1])).toBe('Before ');
    expect(focusMock).toHaveBeenCalledTimes(1);
  });

  it('keeps selected query text editable at input boundaries', () => {
    comboboxValue = 'query';
    const { editor, element } = setup();
    const view = render(
      <InlineCombobox element={element} trigger="@">
        <InlineComboboxInput aria-label="query" />
      </InlineCombobox>
    );
    const input = view.getByLabelText('query') as HTMLInputElement;
    input.setSelectionRange(0, comboboxValue.length);
    expect(fireEvent.keyDown(input, { key: 'Backspace', keyCode: 8 })).toBe(
      true
    );
    expect(
      editor.plugin(BaseComboboxPlugin).read.canEdit(editor.key(element))
    ).toBe(true);
  });

  it.each(['Escape', 'ArrowLeft', 'Backspace'])(
    'leaves %s to an active composition',
    (key) => {
      const { editor, element } = setup();
      const before = editor.read.children();
      const view = render(
        <InlineCombobox element={element} trigger="@">
          <InlineComboboxInput aria-label="query" />
        </InlineCombobox>
      );
      expect(
        fireEvent.keyDown(view.getByLabelText('query'), {
          key,
          keyCode: key === 'Escape' ? 27 : key === 'ArrowLeft' ? 37 : 8,
          isComposing: true,
        })
      ).toBe(true);
      expect(editor.read.children()).toEqual(before);
      expect(focusMock).not.toHaveBeenCalled();
    }
  );

  it('commits the selected feature before running its DOM callback', () => {
    const { editor, element } = setup();
    const before = editor.read.children();
    const onClick = mock(() =>
      expect(editor.read.children()[1].children[1]).toMatchObject({
        ref: 'alice',
        type: 'mention',
      })
    );
    const view = render(
      <InlineCombobox element={element} trigger="@">
        <InlineComboboxInput aria-label="query" />
        <InlineComboboxItem
          value="Alice"
          onSelect={(tx) =>
            tx.plugin(BaseMentionPlugin).insert({ ref: 'alice' })
          }
          onClick={onClick}
        >
          Alice
        </InlineComboboxItem>
      </InlineCombobox>
    );
    const { version } = editor.read.lastCommit()!;
    fireEvent.click(view.getByRole('button', { name: 'Alice' }));
    expect(editor.read.lastCommit()!.version - version).toBe(1);
    expect(onClick).toHaveBeenCalledTimes(1);
    editor.update.history.undo();
    expect(editor.read.children()).toEqual(before);
  });

  it('disables foreign inputs and rejects their item callbacks', () => {
    const { editor, element } = setup();
    editor.update.nodes.set({ userId: 'owner' }, { at: element });
    editor.runtime.userId = 'other';
    const before = editor.read.children();
    const onClick = mock();
    const onSelect = mock();
    const view = render(
      <InlineCombobox element={element} trigger="@">
        <InlineComboboxInput aria-label="query" />
        <InlineComboboxItem value="Alice" onSelect={onSelect} onClick={onClick}>
          Alice
        </InlineComboboxItem>
      </InlineCombobox>
    );
    expect((view.getByLabelText('query') as HTMLInputElement).disabled).toBe(
      true
    );
    fireEvent.click(view.getByRole('button', { name: 'Alice' }));
    fireEvent.blur(view.getByLabelText('query'));
    expect(onSelect).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
    expect(editor.read.children()).toEqual(before);
  });

  it('can remount an existing input without losing its live document identity', () => {
    const { editor, element } = setup();
    const first = render(
      <InlineCombobox element={element} trigger="@">
        <InlineComboboxInput aria-label="query" />
      </InlineCombobox>
    );
    first.unmount();
    editor.update.nodes.insert(
      { type: 'paragraph', children: [{ text: 'Leading' }] },
      { at: [0] }
    );
    const second = render(
      <InlineCombobox element={element} trigger="@">
        <InlineComboboxInput aria-label="query" />
      </InlineCombobox>
    );
    fireEvent.keyDown(second.getByLabelText('query'), {
      key: 'Escape',
      keyCode: 27,
    });
    expect(editor.read.text.string([2])).toBe('Before @');
  });
});
