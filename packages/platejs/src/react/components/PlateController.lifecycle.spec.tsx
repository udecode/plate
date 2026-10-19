import { act, render, renderHook } from '@testing-library/react';
import React from 'react';

import { createEditor } from '../editor';
import {
  useEditor,
  useEditorReadOnly,
  useEditorState,
  useEditorValue,
  useOptionalEditor,
} from '../stores/plate/useEditor';
import { EditorProvider } from './EditorProvider';
import { EditorRoot } from './Plate';
import { EditorContent } from './PlateContent';
import { EditorController } from './PlateController';

function Active() {
  const editor = useOptionalEditor();
  return <output data-testid="active">{editor ? <Value /> : 'empty'}</output>;
}
function Value() {
  return useEditorState((state) => state.text.string([]));
}

test('controller transitions from empty to primary to focused and back to empty', () => {
  const a = createEditor({
    id: 'a',
    initialValue: [{ type: 'paragraph', children: [{ text: 'first' }] }],
  });
  const b = createEditor({
    id: 'b',
    initialValue: [{ type: 'paragraph', children: [{ text: 'second' }] }],
  });
  function App({
    show = false,
    secondary = true,
  }: {
    show?: boolean;
    secondary?: boolean;
  }) {
    return (
      <EditorController>
        {show && (
          <EditorRoot editor={a}>
            <EditorContent aria-label="first" />
          </EditorRoot>
        )}
        {show && secondary && (
          <EditorRoot editor={b} primary={false}>
            <EditorContent aria-label="second" />
          </EditorRoot>
        )}
        <Active />
      </EditorController>
    );
  }
  const view = render(<App />);
  expect(view.getByTestId('active').textContent).toBe('empty');
  view.rerender(<App show />);
  expect(view.getByTestId('active').textContent).toBe('first');
  act(() => {
    const element = view.getByRole('textbox', { name: 'second' });
    element.focus();
  });
  expect(view.getByTestId('active').textContent).toBe('second');
  view.rerender(<App show secondary={false} />);
  expect(view.getByTestId('active').textContent).toBe('first');
  view.rerender(<App />);
  expect(view.getByTestId('active').textContent).toBe('empty');
});

test('strict value hooks reject an empty controller', () => {
  expect(() =>
    renderHook(() => useEditorValue(), {
      wrapper: ({ children }) => (
        <EditorController>{children}</EditorController>
      ),
    })
  ).toThrow('useEditor() requires an active Plate editor.');
});

test('nested controllers own their targets and local providers ignore outer focus', () => {
  const outer = createEditor({ id: 'same' });
  const inner = createEditor({ id: 'same' });
  const selected = new Map<string, ReturnType<typeof useOptionalEditor>>();
  const renders = new Map<string, number>();
  function Probe({ name }: { name: string }) {
    selected.set(name, useOptionalEditor());
    renders.set(name, (renders.get(name) ?? 0) + 1);
    return null;
  }
  const result = render(
    <React.StrictMode>
      <EditorController>
        <EditorRoot editor={outer} suppressInstanceWarning>
          <EditorContent aria-label="outer" />
          <Probe name="localOuter" />
        </EditorRoot>
        <Probe name="outer" />
        <EditorController>
          <EditorRoot editor={inner} suppressInstanceWarning>
            <EditorContent aria-label="inner" />
            <Probe name="localInner" />
          </EditorRoot>
          <Probe name="inner" />
        </EditorController>
      </EditorController>
    </React.StrictMode>
  );
  const a = selected.get('outer');
  const b = selected.get('inner');
  expect(a).not.toBe(b);
  expect(a).toBe(selected.get('localOuter'));
  expect(b).toBe(selected.get('localInner'));
  const renderCount = renders.get('localOuter');
  act(() => result.getByRole('textbox', { name: 'inner' }).focus());
  expect(selected.get('outer')).toBe(a);
  expect(selected.get('inner')).toBe(b);
  expect(renders.get('localOuter')).toBe(renderCount);
});

test('a controller only offers views with an editable DOM mount', () => {
  const editor = createEditor();
  const result = render(
    <EditorController>
      <EditorRoot editor={editor}>
        <span>Shell</span>
      </EditorRoot>
      <Active />
    </EditorController>
  );
  expect(result.getByTestId('active').textContent).toBe('empty');
});

test('replacing the editable DOM retires the captured command view', async () => {
  const editor = createEditor();
  let selected: ReturnType<typeof useEditor>;
  function Probe() {
    selected = useEditor();
    return null;
  }
  function Captured() {
    return <output>{String(useEditorReadOnly())}</output>;
  }
  const tree = (
    as: React.ElementType,
    captured: ReturnType<typeof useEditor> | null = null
  ) => (
    <React.StrictMode>
      <EditorRoot editor={editor}>
        <EditorContent as={as} aria-label="editor" />
        <Probe />
        {captured && (
          <EditorProvider editor={captured}>
            <Captured />
          </EditorProvider>
        )}
      </EditorRoot>
    </React.StrictMode>
  );
  const result = render(tree('div'));
  const original = selected!;
  const originalElement = result.getByRole('textbox');
  await act(async () => result.rerender(tree('section', original)));
  expect(selected!).not.toBe(original);
  expect(result.getByRole('textbox')).not.toBe(originalElement);
  expect(original.read.view.isReadOnly()).toBe(true);
  expect(selected!.read.view.isReadOnly()).toBe(false);
  expect(() => original.update.text.insert('retired')).toThrow('read-only');
  expect(result.container.querySelector('output')?.textContent).toBe('true');
});
