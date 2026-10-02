import { afterAll, afterEach, expect, mock, test } from 'bun:test';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { createEditor, type Element } from 'platejs';
import { BaseComboboxPlugin } from 'platejs/combobox';
import { BaseMentionPlugin } from 'platejs/mention';
import * as React from 'react';

const useEditor = mock();
mock.module('platejs/react', () => ({
  useComposedRef:
    (...refs: React.Ref<HTMLInputElement>[]) =>
    (value: HTMLInputElement | null) =>
      refs.forEach((ref) => {
        if (typeof ref === 'function') ref(value);
        else if (ref) ref.current = value;
      }),
  useEditor,
  useEditorHistory: () => ({ onKeyDown: () => {} }),
  useElementSelected: () => true,
}));

const { InlineCombobox, InlineComboboxInput, InlineComboboxItem } =
  await import('../../../../apps/www/src/registry/components/editor/inline-combobox');

afterEach(async () => {
  await act(async () => {
    cleanup();
  });
});
afterAll(() => mock.restore());

const setup = () => {
  const editor = createEditor({
    plugins: [BaseMentionPlugin],
    initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });
  editor.update.text.insert('@');
  const element = editor.read.children()[0].children[1] as Element;
  useEditor.mockReturnValue(editor);
  return { editor, element };
};

test('current controlled prop does not initialize or reset the real Ariakit input', async () => {
  const { element } = setup();
  const control = (value: string) => (
    <InlineCombobox element={element} trigger="@" value={value}>
      <InlineComboboxInput aria-label="query" />
    </InlineCombobox>
  );
  const view = render(control('rocket'));
  const input = view.getByLabelText('query') as HTMLInputElement;
  expect(input.value).toBe('');
  await act(async () => {
    fireEvent.change(input, { target: { value: 'typed' } });
  });
  expect(input.value).toBe('typed');
  view.rerender(control('reset'));
  expect(input.value).toBe('typed');
});

for (const composing of [false, true])
  test(`current real Ariakit commits on Enter, composing=${composing}`, async () => {
    const { element } = setup();
    const selected = mock();
    const view = render(
      <InlineCombobox element={element} trigger="@">
        <InlineComboboxInput aria-label="query" />
        <InlineComboboxItem value="alice" onSelect={selected}>
          Alice
        </InlineComboboxItem>
      </InlineCombobox>
    );
    await act(async () => {});
    const input = view.getByLabelText('query');
    await act(async () => {
      if (composing) fireEvent.compositionStart(input);
      fireEvent.keyDown(input, {
        key: 'Enter',
        keyCode: composing ? 229 : 13,
        isComposing: composing,
      });
    });
    // This audit pins the observed defect, rather than declaring it accepted behavior.
    expect(selected).toHaveBeenCalledTimes(1);
  });

test('current stateful trigger regex alternates admission across identical insertions', () => {
  const editor = createEditor({
    plugins: [BaseMentionPlugin.configure({ initialState: { trigger: /@/g } })],
    initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
  });
  const admitted: boolean[] = [];
  for (let attempt = 0; attempt < 3; attempt++) {
    editor.update.selection.set({ path: [0, 0], offset: 0 });
    editor.update.text.insert('@');
    const input = editor.read
      .children()[0]
      .children.find((node) => 'type' in node && node.type === 'mentionInput');
    admitted.push(!!input);
    if (input) editor.plugin(BaseComboboxPlugin).api.cancel(editor.key(input));
    else
      editor.update.text.delete({
        at: { path: [0, 0], offset: 1 },
        unit: 'character',
        reverse: true,
      });
  }
  expect(admitted).toEqual([true, false, true]);
});
