import { afterAll, describe, expect, it, mock, spyOn } from 'bun:test';

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { BaseParagraphPlugin, createEditor, createEditorView } from 'platejs';
import { AuthoredPlugin } from 'platejs/authored';
import { CommentsPlugin } from 'platejs/comments/react';
import { EditorRoot } from 'platejs/react';
import * as actualStatic from 'platejs/static';
import React from 'react';

mock.module('@/registry/components/editor/dropdown-menu', () => ({
  DropdownMenu: ({ children }: React.PropsWithChildren) => <>{children}</>,
  DropdownMenuContent: ({ children }: React.PropsWithChildren) => (
    <>{children}</>
  ),
  DropdownMenuGroup: ({ children }: React.PropsWithChildren) => <>{children}</>,
  DropdownMenuItem: ({
    children,
    onSelect,
  }: React.PropsWithChildren<{ onSelect?: () => void }>) => (
    <button type="button" onClick={onSelect}>
      {children}
    </button>
  ),
  DropdownMenuLabel: ({ children }: React.PropsWithChildren) => <>{children}</>,
  DropdownMenuRadioGroup: ({ children }: React.PropsWithChildren) => (
    <>{children}</>
  ),
  DropdownMenuRadioItem: ({ children }: React.PropsWithChildren) => (
    <>{children}</>
  ),
  DropdownMenuSeparator: () => null,
  DropdownMenuTrigger: ({ children }: React.PropsWithChildren) => (
    <>{children}</>
  ),
}));

mock.module('@/registry/components/editor/toolbar', () => ({
  ToolbarButton: ({ children }: React.PropsWithChildren) => (
    <button type="button">{children}</button>
  ),
}));

let exportOptions: {
  comments?: Array<{ target: { range: unknown } }>;
  lossPolicy?: string;
} | null = null;
const exportDocx = mock(
  async (_editor: unknown, options: typeof exportOptions) => {
    exportOptions = options;

    return { blob: new Blob(), diagnostics: [], ok: true as const };
  }
);

const renderStaticHtml = mock(actualStatic.renderStaticHtml);

mock.module('platejs/docx/export', () => ({ exportDocx }));
mock.module('platejs/static', () => ({ ...actualStatic, renderStaticHtml }));
const toastError = mock();
mock.module('sonner', () => ({
  toast: { error: toastError, success: mock(), warning: mock() },
}));

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;
const originalAnchorClick = HTMLAnchorElement.prototype.click;

describe('ExportToolbarButton', () => {
  it('exports canonical proposed comment ranges from an accepted mounted view', async () => {
    const { ExportToolbarButton } = await import('./export-toolbar-button');
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'ABCDE' }], type: 'paragraph' }],
      plugins: [BaseParagraphPlugin, AuthoredPlugin, CommentsPlugin],
      userId: 'alice',
    });

    const proposed = createEditorView(editor, {
      authored: { intent: 'propose', projection: 'markup' },
    });

    proposed.update.text.insert('++', { at: { offset: 0, path: [0, 0] } });
    const proposedRange = {
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 6, path: [0, 0] },
    };
    const created = await proposed.plugin(CommentsPlugin).api.createThread({
      body: [{ children: [{ text: 'Comment' }], type: 'paragraph' }],
      target: { range: proposedRange, type: 'range' },
    });

    expect(created.status).toBe('applied');
    const createObjectURL = mock(() => 'blob:test');
    const revokeObjectURL = mock();

    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    const click = mock();
    HTMLAnchorElement.prototype.click = click;
    const view = render(
      <EditorRoot
        editor={editor}
        authored={{ intent: 'edit', projection: 'accepted' }}
      >
        <ExportToolbarButton />
      </EditorRoot>
    );

    await act(async () => {
      fireEvent.click(view.getByRole('button', { name: 'Export as Word' }));
    });
    await waitFor(() => expect(exportDocx).toHaveBeenCalledTimes(1));

    expect(exportOptions?.comments?.[0]?.target.range).toEqual(proposedRange);
    expect(exportOptions?.lossPolicy).toBe('allow');
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });

  const clickFailedExport = async (name: string) => {
    const { ExportToolbarButton } = await import('./export-toolbar-button');
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'ABC' }], type: 'paragraph' }],
      plugins: [BaseParagraphPlugin],
    });
    const consoleError = spyOn(console, 'error').mockImplementation(() => {});
    toastError.mockClear();
    const view = render(
      <EditorRoot editor={editor}>
        <ExportToolbarButton />
      </EditorRoot>
    );

    try {
      await act(async () => {
        fireEvent.click(view.getByRole('button', { name }));
      });
    } finally {
      view.unmount();
      consoleError.mockRestore();
    }
  };

  it('reports an HTML export that throws', async () => {
    renderStaticHtml.mockImplementationOnce(async () => {
      throw new Error('A component threw while drawing.');
    });

    await clickFailedExport('Export as HTML');

    expect(toastError).toHaveBeenCalledWith(
      'The HTML file could not be exported.'
    );
  });

  it('reports a Word export that throws', async () => {
    exportDocx.mockImplementationOnce(async () => {
      throw new Error('A component threw while drawing.');
    });

    await clickFailedExport('Export as Word');

    expect(toastError).toHaveBeenCalledWith(
      'The Word document could not be exported.'
    );
  });
});

afterAll(() => {
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
  HTMLAnchorElement.prototype.click = originalAnchorClick;
  mock.restore();
});
