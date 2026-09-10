import { expect, it } from 'bun:test';

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { createEditor, Plate, PlateContent, useEditor } from 'platejs/react';
import * as React from 'react';

import { LinkElement, LinkFloatingToolbar, linkPlugin } from './link';

function MountedContent({
  onEditor,
  ...props
}: React.ComponentProps<typeof PlateContent> & {
  onEditor: (editor: ReturnType<typeof useEditor>) => void;
}) {
  const editor = useEditor();
  React.useLayoutEffect(() => onEditor(editor), [editor, onEditor]);
  return <PlateContent {...props} />;
}

const makeEditor = (linked = false) =>
  createEditor({
    plugins: [
      linkPlugin.configure({
        component: LinkElement,
        slots: { afterEditable: LinkFloatingToolbar },
        shortcuts: { trigger: { keys: 'ctrl+k' } },
      }),
    ],
    initialValue: [
      {
        type: 'paragraph',
        children: linked
          ? [
              { text: '' },
              {
                type: 'link',
                url: 'https://example.com',
                children: [{ text: 'Example' }],
              },
              { text: '' },
            ]
          : [{ text: 'Selected text' }],
      },
    ],
    selection: {
      kind: 'text',
      anchor: { path: linked ? [0, 1, 0] : [0, 0], offset: 1 },
      focus: { path: linked ? [0, 1, 0] : [0, 0], offset: 1 },
    },
  });

it('opens only the focused editor with the configured shortcut and dismisses its input', async () => {
  const first = makeEditor();
  const second = makeEditor();
  let firstView!: ReturnType<typeof useEditor>;
  const view = render(
    <>
      <Plate editor={first}>
        <MountedContent
          data-testid="first-editor"
          onEditor={(editor) => {
            firstView = editor;
          }}
        />
      </Plate>
      <Plate editor={second}>
        <PlateContent data-testid="second-editor" />
      </Plate>
      <button type="button">Outside</button>
    </>
  );
  try {
    act(() => firstView.api.dom.focus());
    fireEvent.keyDown(view.getByTestId('first-editor'), {
      key: 'k',
      code: 'KeyK',
      ctrlKey: true,
      keyCode: 75,
      which: 75,
    });
    const input = await view.findByPlaceholderText('Paste link');
    act(() => input.focus());
    expect(first.plugin(linkPlugin).store.get().mode).toBe('insert');
    expect(second.plugin(linkPlugin).store.get().mode).toBe('');
    fireEvent.keyDown(input, {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      which: 27,
    });
    await waitFor(() =>
      expect(view.queryByPlaceholderText('Paste link')).toBeNull()
    );
    expect(first.plugin(linkPlugin).store.get().mode).toBe('');
    act(() => firstView.api.dom.focus());
    fireEvent.keyDown(view.getByTestId('first-editor'), {
      key: 'k',
      code: 'KeyK',
      ctrlKey: true,
      keyCode: 75,
      which: 75,
    });
    await view.findByPlaceholderText('Paste link');
    fireEvent.pointerDown(view.getByRole('button', { name: 'Outside' }));
    await waitFor(() =>
      expect(view.queryByPlaceholderText('Paste link')).toBeNull()
    );
  } finally {
    view.unmount();
  }
});

it('discards an edit draft on Escape while preserving the link actions and href', async () => {
  const editor = makeEditor(true);
  const view = render(
    <Plate editor={editor}>
      <PlateContent />
    </Plate>
  );
  try {
    act(() => editor.api.dom.focus());
    fireEvent.click(await view.findByText('Edit link'));
    const input = await view.findByPlaceholderText('Paste link');
    act(() => input.focus());
    fireEvent.change(input, { target: { value: 'https://example.com/draft' } });
    fireEvent.keyDown(input, {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      which: 27,
    });
    await view.findByText('Edit link');
    expect(view.queryByPlaceholderText('Paste link')).toBeNull();
    expect(editor.read.nodes.get([0, 1])?.[0]).toMatchObject({
      url: 'https://example.com',
    });
  } finally {
    view.unmount();
  }
});

it('leaves the shortcut native in a readonly editor', () => {
  const editor = makeEditor();
  const view = render(
    <Plate editor={editor}>
      <PlateContent readOnly data-testid="readonly" />
    </Plate>
  );
  try {
    expect(
      fireEvent.keyDown(view.getByTestId('readonly'), {
        key: 'k',
        code: 'KeyK',
        ctrlKey: true,
        keyCode: 75,
        which: 75,
      })
    ).toBe(true);
    expect(editor.plugin(linkPlugin).store.get().mode).toBe('');
  } finally {
    view.unmount();
  }
});

it('keeps an IME draft until Enter is pressed after composition', async () => {
  const editor = makeEditor();
  let mounted!: ReturnType<typeof useEditor>;
  const view = render(
    <Plate editor={editor}>
      <MountedContent
        data-testid="composing-editor"
        onEditor={(mountedEditor) => {
          mounted = mountedEditor;
        }}
      />
    </Plate>
  );
  try {
    act(() => mounted.api.dom.focus());
    fireEvent.keyDown(view.getByTestId('composing-editor'), {
      key: 'k',
      code: 'KeyK',
      ctrlKey: true,
      keyCode: 75,
      which: 75,
    });
    const input = await view.findByPlaceholderText('Paste link');
    act(() => input.focus());
    fireEvent.change(input, { target: { value: 'https://example.com/日本' } });
    const commit = editor.read.lastCommit();
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      isComposing: true,
      keyCode: 229,
      which: 229,
    });
    expect(editor.read.lastCommit()).toBe(commit);
    expect(editor.plugin(linkPlugin).store.get().mode).toBe('insert');
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
    });
    await waitFor(() =>
      expect(view.queryByPlaceholderText('Paste link')).toBeNull()
    );
    expect(editor.read.nodes.find({ type: linkPlugin })?.[0]).toMatchObject({
      url: 'https://example.com/%E6%97%A5%E6%9C%AC',
    });
  } finally {
    view.unmount();
  }
});

it('dismisses URL input when focus enters an external iframe', async () => {
  const editor = makeEditor();
  let mounted!: ReturnType<typeof useEditor>;
  const view = render(
    <>
      <Plate editor={editor}>
        <MountedContent
          data-testid="frame-editor"
          onEditor={(mountedEditor) => {
            mounted = mountedEditor;
          }}
        />
      </Plate>
      <iframe title="External preview" sandbox="" />
    </>
  );
  try {
    act(() => mounted.api.dom.focus());
    fireEvent.keyDown(view.getByTestId('frame-editor'), {
      key: 'k',
      code: 'KeyK',
      ctrlKey: true,
      keyCode: 75,
      which: 75,
    });
    const input = await view.findByPlaceholderText('Paste link');
    act(() => input.focus());
    const frame = view.getByTitle('External preview');
    act(() => frame.focus());
    fireEvent.blur(window);
    await waitFor(() =>
      expect(view.queryByPlaceholderText('Paste link')).toBeNull()
    );
    expect(document.activeElement).toBe(frame);
  } finally {
    view.unmount();
  }
});
