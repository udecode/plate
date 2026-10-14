import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from 'bun:test';

import { act, cleanup, render } from '@testing-library/react';
import { BaseParagraphPlugin, createEditor } from 'platejs';
import { CommentsPlugin } from 'platejs/comments/react';
import * as docxImport from 'platejs/docx/import';
import { MarkdownPlugin } from 'platejs/markdown';
import { EditorRoot } from 'platejs/react';
import React from 'react';
import { toast } from 'sonner';
import * as filePicker from 'use-file-picker';

import { TooltipProvider } from '@/components/ui/tooltip';
import { DocxSourceProvider } from '@/registry/components/editor/docx-source';
import { Toolbar } from '@/registry/components/editor/toolbar';

import { ImportToolbarButton } from './import-toolbar-button';

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
const warningImport = {
  ...validImport,
  comments: [],
  diagnostics: [
    ...Array.from({ length: 19 }, () => ({
      code: 'unsupported-content',
      impact: 'lossless',
      message: 'Removed unsafe HTML element <style>.',
      severity: 'warning',
    })),
    {
      code: 'unsupported-content',
      impact: 'lossy',
      message: 'Dropped a footnote.',
      severity: 'warning',
    },
  ],
};
let importResult:
  | typeof invalidImport
  | typeof validImport
  | typeof warningImport = invalidImport;
let importWord:
  | ((input: {
      plainFiles: Array<{ arrayBuffer: () => Promise<ArrayBuffer> }>;
    }) => Promise<void>)
  | undefined;

beforeEach(() => {
  importWord = undefined;
  spyOn(filePicker, 'useFilePicker').mockImplementation(((options: {
    accept: string[];
    onFilesSelected: typeof importWord;
  }) => {
    if (options.accept.includes('.docx')) {
      importWord = options.onFilesSelected;
    }

    return { openFilePicker: () => {} };
  }) as never);
  spyOn(docxImport, 'importDocx').mockImplementation(
    (async () => importResult) as never
  );
  spyOn(toast, 'error').mockImplementation(() => '');
  spyOn(toast, 'warning');
});

afterEach(() => {
  cleanup();
  mock.restore();
});

describe('ImportToolbarButton', () => {
  it('keeps the document and comments when imported comment preparation fails', async () => {
    importResult = invalidImport;
    invalidSource.dispose.mockClear();
    const before = [{ children: [{ text: 'before' }], type: 'paragraph' }];
    const editor = createEditor({
      initialValue: before,
      plugins: [BaseParagraphPlugin, MarkdownPlugin, CommentsPlugin],
    });
    const documentBefore = structuredClone(editor.read.value());
    const commentsBefore = editor.plugin(CommentsPlugin).api.toJSON();
    const onImport = mock();

    render(
      <DocxSourceProvider>
        <EditorRoot editor={editor}>
          <TooltipProvider>
            <Toolbar>
              <ImportToolbarButton
                onImport={onImport}
                plugins={[BaseParagraphPlugin, MarkdownPlugin, CommentsPlugin]}
              />
            </Toolbar>
          </TooltipProvider>
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
    expect(toast.error).toHaveBeenCalledWith(
      'The Word document and its comments could not be imported.'
    );
  });

  it('sums import warnings into one toast and skips lossless cleanups', async () => {
    importResult = warningImport;
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, MarkdownPlugin, CommentsPlugin],
    });

    render(
      <DocxSourceProvider>
        <EditorRoot editor={editor}>
          <TooltipProvider>
            <Toolbar>
              <ImportToolbarButton
                onImport={() => {}}
                plugins={[BaseParagraphPlugin, MarkdownPlugin, CommentsPlugin]}
              />
            </Toolbar>
          </TooltipProvider>
        </EditorRoot>
      </DocxSourceProvider>
    );

    await act(async () => {
      await importWord?.({
        plainFiles: [{ arrayBuffer: async () => new ArrayBuffer(0) }],
      });
    });

    expect(toast.warning).toHaveBeenCalledTimes(1);
    expect(toast.warning).toHaveBeenCalledWith('Imported with 1 warning.');
  });

  it('returns a prepared editor without mutating the mounted editor', async () => {
    importResult = validImport;
    validSource.dispose.mockClear();
    const before = [{ children: [{ text: 'before' }], type: 'paragraph' }];
    const editor = createEditor({
      initialValue: before,
      plugins: [BaseParagraphPlugin, MarkdownPlugin, CommentsPlugin],
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
          <TooltipProvider>
            <Toolbar>
              <ImportToolbarButton
                onImport={onImport}
                plugins={[BaseParagraphPlugin, MarkdownPlugin, CommentsPlugin]}
              />
            </Toolbar>
          </TooltipProvider>
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
    expect(importedEditor.userId).toBe('alice');
    expect(validSource.dispose).not.toHaveBeenCalled();

    unsubscribe();
  });
});
