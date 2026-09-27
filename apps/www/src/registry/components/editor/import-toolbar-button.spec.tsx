import { afterAll, afterEach, describe, expect, it, mock } from 'bun:test';

import { act, cleanup, render } from '@testing-library/react';
import { BaseParagraphPlugin, createEditor } from 'platejs';
import { CommentsPlugin } from 'platejs/comments/react';
import { MarkdownPlugin } from 'platejs/markdown';
import { EditorRoot } from 'platejs/react';
import React from 'react';

import { DocxSourceProvider } from '@/registry/components/editor/docx-source';

mock.module('@/registry/components/editor/dropdown-menu', () => ({
  DropdownMenu: ({ children }: React.PropsWithChildren) => <>{children}</>,
  DropdownMenuContent: ({ children }: React.PropsWithChildren) => (
    <>{children}</>
  ),
  DropdownMenuGroup: ({ children }: React.PropsWithChildren) => <>{children}</>,
  DropdownMenuItem: ({ children }: React.PropsWithChildren) => <>{children}</>,
  DropdownMenuTrigger: ({ children }: React.PropsWithChildren) => (
    <>{children}</>
  ),
}));

mock.module('@/registry/components/editor/toolbar', () => ({
  ToolbarButton: ({ children }: React.PropsWithChildren) => (
    <button type="button">{children}</button>
  ),
}));

let importWord:
  | ((input: {
      plainFiles: Array<{ arrayBuffer: () => Promise<ArrayBuffer> }>;
    }) => Promise<void>)
  | undefined;

mock.module('use-file-picker', () => ({
  useFilePicker: (options: {
    accept: string[];
    onFilesSelected: typeof importWord;
  }) => {
    if (options.accept.includes('.docx')) {
      importWord = options.onFilesSelected;
    }

    return { openFilePicker: () => {} };
  },
}));

const invalidSource = { dispose: mock() };
const validSource = { dispose: mock() };
const invalidImport = {
  comments: [
    {
      author: { initials: 'A', name: 'Alice' },
      body: [
        {
          children: [{ text: 'Comment' }],
          invalid: () => {},
          type: 'p',
        },
      ],
      createdAt: null,
      durableId: null,
      id: 'comment',
      parentId: null,
      resolved: null,
      target: {
        range: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 5, path: [0, 0] },
        },
      },
    },
  ],
  diagnostics: [],
  document: [{ children: [{ text: 'after' }], type: 'paragraph' }],
  ok: true as const,
  source: invalidSource,
};
const validImport = {
  ...invalidImport,
  comments: [
    {
      ...invalidImport.comments[0],
      body: [{ children: [{ text: 'Comment' }], type: 'paragraph' }],
    },
  ],
  source: validSource,
};
let importResult: typeof invalidImport | typeof validImport = invalidImport;
const importDocx = mock(async () => importResult);

mock.module('platejs/docx/import', () => ({ importDocx }));

const toastError = mock();

mock.module('sonner', () => ({
  toast: {
    error: toastError,
    success: mock(),
    warning: mock(),
  },
}));

describe('ImportToolbarButton', () => {
  it('keeps the document and comments when imported comment preparation fails', async () => {
    importResult = invalidImport;
    invalidSource.dispose.mockClear();
    const { ImportToolbarButton } = await import('./import-toolbar-button');
    const before = [{ children: [{ text: 'before' }], type: 'paragraph' }];
    const editor = createEditor({
      initialValue: before,
      plugins: [
        BaseParagraphPlugin,
        MarkdownPlugin,
        CommentsPlugin.configure({
          initialState: { currentUserId: 'alice' },
        }),
      ],
    });
    const documentBefore = structuredClone(editor.read.value());
    const commentsBefore = editor.plugin(CommentsPlugin).api.toJSON();
    const onImport = mock();

    render(
      <DocxSourceProvider>
        <EditorRoot editor={editor}>
          <ImportToolbarButton
            onImport={onImport}
            plugins={[BaseParagraphPlugin, MarkdownPlugin, CommentsPlugin]}
          />
        </EditorRoot>
      </DocxSourceProvider>
    );
    expect(importWord).toBeDefined();

    await act(async () => {
      await importWord?.({
        plainFiles: [{ arrayBuffer: async () => new ArrayBuffer(0) }],
      });
    });

    expect(editor.read.value()).toEqual(documentBefore);
    expect(editor.plugin(CommentsPlugin).api.toJSON()).toEqual(commentsBefore);
    expect(onImport).not.toHaveBeenCalled();
    expect(invalidSource.dispose).toHaveBeenCalledTimes(1);
    expect(toastError).toHaveBeenCalledWith(
      'The Word document and its comments could not be imported.'
    );
  });

  it('returns a prepared editor without mutating the mounted editor', async () => {
    importResult = validImport;
    validSource.dispose.mockClear();
    const { ImportToolbarButton } = await import('./import-toolbar-button');
    const before = [{ children: [{ text: 'before' }], type: 'paragraph' }];
    const editor = createEditor({
      initialValue: before,
      plugins: [
        BaseParagraphPlugin,
        MarkdownPlugin,
        CommentsPlugin.configure({
          initialState: { currentUserId: 'alice' },
        }),
      ],
      userId: 'alice',
    });

    editor.update((tx) =>
      tx.text.insert('!', { at: { offset: 6, path: [0, 0] } })
    );
    const documentBefore = structuredClone(editor.read.value());
    const historyBefore = editor.read.history();
    const commits = mock();
    const unsubscribe = editor.subscribeCommit(commits);
    const onImport = mock();

    render(
      <DocxSourceProvider>
        <EditorRoot editor={editor}>
          <ImportToolbarButton
            onImport={onImport}
            plugins={[BaseParagraphPlugin, MarkdownPlugin, CommentsPlugin]}
          />
        </EditorRoot>
      </DocxSourceProvider>
    );
    commits.mockClear();

    await act(async () => {
      await importWord?.({
        plainFiles: [{ arrayBuffer: async () => new ArrayBuffer(0) }],
      });
    });

    expect(commits).not.toHaveBeenCalled();
    expect(editor.read.value()).toEqual(documentBefore);
    expect(editor.read.history()).toEqual(historyBefore);
    expect(onImport).toHaveBeenCalledTimes(1);

    const importedEditor = onImport.mock.calls[0][0];

    expect(importedEditor).not.toBe(editor);
    expect(importedEditor.read.text.string([])).toBe('after');
    expect(
      importedEditor.plugin(CommentsPlugin).api.getThread('word:comment')
    ).toBeDefined();
    expect(importedEditor.runtime.userId).toBe('alice');
    expect(
      importedEditor.plugin(CommentsPlugin).store.get('currentUserId')
    ).toBe('alice');
    expect(validSource.dispose).not.toHaveBeenCalled();

    unsubscribe();
  });
});

afterEach(cleanup);
afterAll(() => mock.restore());
