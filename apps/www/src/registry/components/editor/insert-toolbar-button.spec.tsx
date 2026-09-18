import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from 'bun:test';

import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { BaseImagePlugin } from 'platejs/media';
import { createEditor, EditorRoot } from 'platejs/react';
import * as React from 'react';

import { BaseBasicBlocksKit } from './basic-blocks-static';
import { linkPlugin } from './link';

mock.module('@/registry/components/editor/dropdown-menu', () => ({
  DropdownMenu: ({ children }: React.PropsWithChildren) => <>{children}</>,
  DropdownMenuContent: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    finalFocus,
    onSelect,
  }: React.PropsWithChildren<{
    finalFocus?: false | (() => void);
    onSelect?: () => void;
  }>) => (
    <button
      onClick={() => {
        onSelect?.();
        if (finalFocus) finalFocus();
      }}
      type="button"
    >
      {children}
    </button>
  ),
  DropdownMenuTrigger: ({ children }: React.PropsWithChildren) => (
    <>{children}</>
  ),
}));

mock.module('@/registry/components/editor/toolbar', () => ({
  ToolbarButton: ({
    children,
    isDropdown: _isDropdown,
    pressed: _pressed,
    tooltip: _tooltip,
    ...props
  }: React.ComponentProps<'button'> & {
    isDropdown?: boolean;
    pressed?: boolean;
    tooltip?: React.ReactNode;
  }) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  ToolbarMenuGroup: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
}));

const createTestEditor = () =>
  createEditor({
    plugins: [...BaseBasicBlocksKit, linkPlugin],
    initialValue: [{ children: [{ text: 'source' }], type: 'paragraph' }],
    selection: {
      kind: 'text',
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    },
  });

let currentEditor: ReturnType<typeof createTestEditor>;

async function renderInsertMenu<E>(editor: E) {
  const { InsertToolbarButton } = await import(
    `./insert-toolbar-button?test=${Math.random().toString(36).slice(2)}`
  );

  return render(
    <EditorRoot<E> editor={editor}>
      <InsertToolbarButton />
    </EditorRoot>
  );
}

beforeEach(() => {
  currentEditor = createTestEditor();
});

afterEach(cleanup);

afterAll(() => {
  mock.restore();
});

describe('insert toolbar commands', () => {
  it('runs the typed block callback and returns focus to its captured editor', async () => {
    const focus = spyOn(currentEditor.api.dom, 'focus').mockImplementation(
      () => {}
    );
    const view = await renderInsertMenu(currentEditor);

    expect(view.queryByText('Code Drawing')).toBeNull();

    fireEvent.click(view.getByRole('button', { name: 'Heading 2' }));

    expect(currentEditor.read.children()).toMatchObject([
      { children: [{ text: 'source' }], type: 'paragraph' },
      { children: [{ text: '' }], level: 2, type: 'heading' },
    ]);
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it('leaves final focus to the Link UI action', async () => {
    const focus = spyOn(currentEditor.api.dom, 'focus').mockImplementation(
      () => {}
    );
    const view = await renderInsertMenu(currentEditor);

    fireEvent.click(view.getByRole('button', { name: 'Link' }));

    expect(currentEditor.plugin(linkPlugin).store.get()).toMatchObject({
      mode: 'insert',
      openEditorId: currentEditor.id,
      text: '',
    });
    expect(focus).not.toHaveBeenCalled();
  });

  it('keeps async media replacement and focus owned by the captured editor', async () => {
    const imageEditor = createEditor({
      plugins: [...BaseBasicBlocksKit, BaseImagePlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });
    const focus = spyOn(imageEditor.api.dom, 'focus').mockImplementation(
      () => {}
    );
    spyOn(imageEditor.api.dom, 'editable').mockReturnValue(document.body);
    const prompt = spyOn(window, 'prompt').mockReturnValue(
      'https://example.com/image.png'
    );
    const view = await renderInsertMenu(imageEditor);

    fireEvent.click(view.getByRole('button', { name: 'Image' }));

    await waitFor(() => {
      expect(imageEditor.read.children()).toMatchObject([
        { type: 'image', url: 'https://example.com/image.png' },
      ]);
      expect(focus).toHaveBeenCalledTimes(1);
    });
    prompt.mockRestore();
  });
});
