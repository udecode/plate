import { expect, it } from 'bun:test';

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import {
  createEditor,
  EditorRoot,
  EditorContent,
  useEditor,
} from 'platejs/react';
import * as React from 'react';

import { LinkElement, LinkFloatingToolbar, linkPlugin } from './link';

function MountedContent({
  onEditor,
  ...props
}: React.ComponentProps<typeof EditorContent> & {
  onEditor: (editor: ReturnType<typeof useEditor>) => void;
}) {
  const editor = useEditor();
  React.useLayoutEffect(() => onEditor(editor), [editor, onEditor]);
  return <EditorContent {...props} />;
}

const pressLinkShortcut = (target: Element) =>
  fireEvent.keyDown(target, {
    key: 'k',
    code: 'KeyK',
    ctrlKey: true,
    keyCode: 75,
    which: 75,
  });

const pressEscape = (target: Element) =>
  fireEvent.keyDown(target, {
    key: 'Escape',
    code: 'Escape',
    keyCode: 27,
    which: 27,
  });

// A browser sends the page no focusin when focus moves into a frame, only a
// window blur; happy-dom sends both.
const focusFrame = (frame: HTMLElement) => {
  const stop = (event: FocusEvent) => event.stopImmediatePropagation();

  window.addEventListener('focusin', stop, true);
  act(() => frame.focus());
  window.removeEventListener('focusin', stop, true);
  fireEvent.blur(window);
};

const renderInShadowRoot = (ui: React.ReactElement) => {
  // happy-dom reports an AppleWebKit user agent and has no execCommand, which
  // Plite calls to repair a selection in a WebKit shadow root.
  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    value: () => false,
  });
  const host = document.body.appendChild(document.createElement('div'));
  const view = render(ui, {
    container: host
      .attachShadow({ mode: 'open' })
      .appendChild(document.createElement('div')),
  });
  const { unmount } = view;

  return {
    ...view,
    unmount: () => {
      unmount();
      host.remove();
      Reflect.deleteProperty(document, 'execCommand');
    },
  };
};

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
      <EditorRoot editor={first}>
        <MountedContent
          data-testid="first-editor"
          onEditor={(editor) => {
            firstView = editor;
          }}
        />
      </EditorRoot>
      <EditorRoot editor={second}>
        <EditorContent data-testid="second-editor" />
      </EditorRoot>
      <button type="button">Outside</button>
    </>
  );
  try {
    act(() => firstView.api.dom.focus());
    pressLinkShortcut(view.getByTestId('first-editor'));
    const input = await view.findByPlaceholderText('Paste link');
    act(() => input.focus());
    expect(first.plugin(linkPlugin).store.get().mode).toBe('insert');
    expect(second.plugin(linkPlugin).store.get().mode).toBe('');
    pressEscape(input);
    await waitFor(() =>
      expect(view.queryByPlaceholderText('Paste link')).toBeNull()
    );
    expect(first.plugin(linkPlugin).store.get().mode).toBe('');
    act(() => firstView.api.dom.focus());
    pressLinkShortcut(view.getByTestId('first-editor'));
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
    <EditorRoot editor={editor}>
      <EditorContent />
    </EditorRoot>
  );
  try {
    act(() => editor.api.dom.focus());
    fireEvent.click(await view.findByText('Edit link'));
    const input = await view.findByPlaceholderText('Paste link');
    act(() => input.focus());
    fireEvent.change(input, { target: { value: 'https://example.com/draft' } });
    pressEscape(input);
    await view.findByText('Edit link');
    expect(view.queryByPlaceholderText('Paste link')).toBeNull();
    expect(editor.read.nodes.get([0, 1])?.[0]).toMatchObject({
      url: 'https://example.com',
    });
  } finally {
    view.unmount();
  }
});

it('hides the link toolbar on Escape when no form is open', async () => {
  const editor = makeEditor(true);
  const view = render(
    <EditorRoot editor={editor}>
      <EditorContent />
    </EditorRoot>
  );
  try {
    act(() => editor.api.dom.focus());
    const editLink = await view.findByText('Edit link');
    pressEscape(editLink);
    await waitFor(() => expect(editLink.isConnected).toBe(false));
  } finally {
    view.unmount();
  }
});

it('shows the link toolbar again after Enter saves an edited address', async () => {
  const editor = makeEditor(true);
  const view = render(
    <EditorRoot editor={editor}>
      <EditorContent data-testid="editor" />
    </EditorRoot>
  );
  try {
    act(() => editor.api.dom.focus());
    fireEvent.click(await view.findByText('Edit link'));
    const input = await view.findByPlaceholderText('Paste link');
    act(() => input.focus());
    fireEvent.change(input, { target: { value: 'https://example.com/saved' } });
    fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
    });
    await view.findByText('Edit link');
    await waitFor(() =>
      expect(document.activeElement).toBe(view.getByTestId('editor'))
    );
    expect(editor.read.nodes.get([0, 1])?.[0]).toMatchObject({
      url: 'https://example.com/saved',
    });
  } finally {
    view.unmount();
  }
});

it('keeps Edit link open while nothing has focus and closes it when the editor takes focus', async () => {
  const editor = makeEditor(true);
  const view = render(
    <EditorRoot editor={editor}>
      <EditorContent data-testid="editor" />
    </EditorRoot>
  );
  try {
    act(() => editor.api.dom.focus());
    fireEvent.click(await view.findByText('Edit link'));
    const text = await view.findByPlaceholderText('Text to display');
    act(() => text.focus());
    fireEvent.change(text, { target: { value: 'Draft' } });
    act(() => text.blur());
    expect(text.isConnected).toBe(true);
    act(() => view.getByTestId('editor').focus());
    expect(text.isConnected).toBe(false);
    pressLinkShortcut(view.getByTestId('editor'));
    expect(await view.findByPlaceholderText('Text to display')).toHaveProperty(
      'value',
      'Example'
    );
  } finally {
    view.unmount();
  }
});

it('goes back to the link toolbar when focus moves from Edit link to the page', async () => {
  const editor = makeEditor(true);
  const view = render(
    <>
      <EditorRoot editor={editor}>
        <EditorContent />
      </EditorRoot>
      <button type="button">Outside</button>
    </>
  );
  try {
    act(() => editor.api.dom.focus());
    fireEvent.click(await view.findByText('Edit link'));
    const text = await view.findByPlaceholderText('Text to display');
    act(() => text.focus());
    fireEvent.change(text, { target: { value: 'Draft' } });
    act(() => view.getByRole('button', { name: 'Outside' }).focus());
    expect(text.isConnected).toBe(false);
    await view.findByText('Edit link');
  } finally {
    view.unmount();
  }
});

it('keeps Edit link open when focus comes back to its field in a shadow root', async () => {
  const editor = makeEditor(true);
  const view = renderInShadowRoot(
    <EditorRoot editor={editor}>
      <EditorContent />
    </EditorRoot>
  );
  try {
    act(() => editor.api.dom.focus());
    fireEvent.click(await view.findByText('Edit link'));
    const text = await view.findByPlaceholderText('Text to display');
    act(() => text.focus());
    fireEvent.change(text, { target: { value: 'Draft' } });
    act(() => text.blur());
    act(() => text.focus());
    // happy-dom does not retarget focus events, so this sends the document the
    // focusin a browser sends it, whose target is the shadow host.
    act(() => {
      (view.container.getRootNode() as ShadowRoot).host.dispatchEvent(
        new FocusEvent('focusin', { bubbles: true, composed: true })
      );
    });
    expect(text.isConnected).toBe(true);
    expect(text).toHaveProperty('value', 'Draft');
  } finally {
    view.unmount();
  }
});

it('closes Edit link when focus moves from its field to the editor in a shadow root', async () => {
  const editor = makeEditor(true);
  const view = renderInShadowRoot(
    <EditorRoot editor={editor}>
      <EditorContent data-testid="editor" />
    </EditorRoot>
  );
  try {
    act(() => editor.api.dom.focus());
    fireEvent.click(await view.findByText('Edit link'));
    const text = await view.findByPlaceholderText('Text to display');
    act(() => text.focus());
    fireEvent.change(text, { target: { value: 'Draft' } });
    act(() => view.getByTestId('editor').focus());
    expect(text.isConnected).toBe(false);
    pressLinkShortcut(view.getByTestId('editor'));
    expect(await view.findByPlaceholderText('Text to display')).toHaveProperty(
      'value',
      'Example'
    );
  } finally {
    view.unmount();
  }
});

it('takes the link shortcut from the editor over a selection inside a link', async () => {
  const editor = makeEditor(true);
  let editorSawShortcut = false;
  const view = render(
    <EditorRoot editor={editor}>
      <EditorContent
        data-testid="editor"
        onKeyDown={() => {
          editorSawShortcut = true;
        }}
      />
    </EditorRoot>
  );
  try {
    act(() => editor.api.dom.focus());
    await view.findByText('Edit link');
    act(() =>
      editor.update.selection.set({
        anchor: { path: [0, 1, 0], offset: 1 },
        focus: { path: [0, 1, 0], offset: 4 },
      })
    );
    expect(pressLinkShortcut(view.getByTestId('editor'))).toBe(false);
    expect(editorSawShortcut).toBe(false);
  } finally {
    view.unmount();
  }
});

it('leaves the link shortcut to the browser over a selection that leaves a link', async () => {
  const editor = makeEditor(true);
  let editorSawShortcut = false;
  const view = render(
    <EditorRoot editor={editor}>
      <EditorContent
        data-testid="editor"
        onKeyDown={() => {
          editorSawShortcut = true;
        }}
      />
    </EditorRoot>
  );
  try {
    act(() => editor.api.dom.focus());
    await view.findByText('Edit link');
    act(() =>
      editor.update.selection.set({
        anchor: { path: [0, 1, 0], offset: 3 },
        focus: { path: [0, 2], offset: 0 },
      })
    );
    expect(pressLinkShortcut(view.getByTestId('editor'))).toBe(true);
    expect(editorSawShortcut).toBe(true);
    expect(editor.plugin(linkPlugin).store.get().mode).toBe('');
  } finally {
    view.unmount();
  }
});

it('leaves the shortcut native in a readonly editor', () => {
  const editor = makeEditor();
  const view = render(
    <EditorRoot editor={editor}>
      <EditorContent readOnly data-testid="readonly" />
    </EditorRoot>
  );
  try {
    expect(pressLinkShortcut(view.getByTestId('readonly'))).toBe(true);
    expect(editor.plugin(linkPlugin).store.get().mode).toBe('');
  } finally {
    view.unmount();
  }
});

it('keeps an IME draft until Enter is pressed after composition', async () => {
  const editor = makeEditor();
  let mounted!: ReturnType<typeof useEditor>;
  const view = render(
    <EditorRoot editor={editor}>
      <MountedContent
        data-testid="composing-editor"
        onEditor={(mountedEditor) => {
          mounted = mountedEditor;
        }}
      />
    </EditorRoot>
  );
  try {
    act(() => mounted.api.dom.focus());
    pressLinkShortcut(view.getByTestId('composing-editor'));
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
      <EditorRoot editor={editor}>
        <MountedContent
          data-testid="frame-editor"
          onEditor={(mountedEditor) => {
            mounted = mountedEditor;
          }}
        />
      </EditorRoot>
      <iframe title="External preview" sandbox="" />
    </>
  );
  try {
    act(() => mounted.api.dom.focus());
    pressLinkShortcut(view.getByTestId('frame-editor'));
    const input = await view.findByPlaceholderText('Paste link');
    act(() => input.focus());
    const frame = view.getByTitle('External preview');
    focusFrame(frame);
    await waitFor(() => expect(input.isConnected).toBe(false));
    expect(document.activeElement).toBe(frame);
  } finally {
    view.unmount();
  }
});

it('goes back to the link toolbar when focus enters an external iframe from Edit link', async () => {
  const editor = makeEditor(true);
  const view = render(
    <>
      <EditorRoot editor={editor}>
        <EditorContent />
      </EditorRoot>
      <iframe title="External preview" sandbox="" />
    </>
  );
  try {
    act(() => editor.api.dom.focus());
    fireEvent.click(await view.findByText('Edit link'));
    const input = await view.findByPlaceholderText('Paste link');
    act(() => input.focus());
    const frame = view.getByTitle('External preview');
    act(() => input.blur());
    focusFrame(frame);
    await view.findByText('Edit link');
    expect(input.isConnected).toBe(false);
    expect(editor.plugin(linkPlugin).store.get().mode).toBe('edit');
    expect(document.activeElement).toBe(frame);
  } finally {
    view.unmount();
  }
});

it('goes back to the link toolbar when focus enters an iframe in a shadow root', async () => {
  const editor = makeEditor(true);
  const view = renderInShadowRoot(
    <>
      <EditorRoot editor={editor}>
        <EditorContent />
      </EditorRoot>
      <iframe title="External preview" sandbox="" />
    </>
  );
  try {
    act(() => editor.api.dom.focus());
    fireEvent.click(await view.findByText('Edit link'));
    const input = await view.findByPlaceholderText('Paste link');
    act(() => input.focus());
    act(() => input.blur());
    focusFrame(view.getByTitle('External preview'));
    await view.findByText('Edit link');
    expect(input.isConnected).toBe(false);
  } finally {
    view.unmount();
  }
});
