'use client';

import { ArrowUpToLineIcon } from 'lucide-react';
import {
  createEditor,
  NodeApi,
  type BasePluginInput,
  type Editor,
  type EditorDocumentValue,
} from 'platejs';
import type {
  CommentThread,
  CommentsJSON,
  CommentUser,
} from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import type { DocxComment } from 'platejs/docx/import';
import { MarkdownPlugin } from 'platejs/markdown';
import { useEditor, useModelEditor } from 'platejs/react';
import * as React from 'react';
import { toast } from 'sonner';
import { useFilePicker } from 'use-file-picker';

import { useDocxSource } from '@/registry/components/editor/docx-source';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/registry/components/editor/dropdown-menu';
import { ToolbarButton } from '@/registry/components/editor/toolbar';

const toastWarnings = (
  diagnostics: ReadonlyArray<Readonly<{ message: string; severity: string }>>
) => {
  diagnostics
    .filter(({ severity }) => severity === 'warning')
    .forEach(({ message }) => toast.warning(message));
};

const docxCommentText = (comment: DocxComment) =>
  comment.body
    .map((node) => NodeApi.string(node))
    .join('\n')
    .trim();

const docxCommentUser = (
  comment: DocxComment,
  users: Record<string, CommentUser>
) => {
  const name = comment.author?.name.trim() || 'Unknown';
  const id = `word:${JSON.stringify([name, comment.author?.initials ?? ''])}`;

  users[id] ??= Object.freeze({ id, name });

  return id;
};

const importDocxComments = (editor: Editor, source: readonly DocxComment[]) => {
  const importedAt = new Date().toISOString();
  const timestamp = (value: string | null) =>
    value &&
    /^\d{4}-\d{2}-\d{2}T/.test(value) &&
    Number.isFinite(Date.parse(value))
      ? value
      : importedAt;
  const byId = new Map(source.map((comment) => [comment.id, comment]));
  const groups = new Map<string, DocxComment[]>();
  const rootOf = (comment: DocxComment) => {
    let current = comment;
    const seen = new Set([comment.id]);

    while (current.parentId) {
      const parent = byId.get(current.parentId);

      if (!parent || seen.has(parent.id)) break;
      seen.add(parent.id);
      current = parent;
    }

    return current;
  };

  source.forEach((comment) => {
    const root = rootOf(comment);
    const group = groups.get(root.id) ?? [];

    group.push(comment);
    groups.set(root.id, group);
  });

  const users: Record<string, CommentUser> = {};
  const threads: CommentThread[] = [];
  const ranges: Array<CommentsJSON['ranges'][number]> = [];
  let imported = 0;

  groups.forEach((group, rootId) => {
    const root = byId.get(rootId) ?? group[0];
    const target =
      root.target ?? group.find((comment) => comment.target)?.target;
    const messages = [root, ...group.filter((comment) => comment !== root)]
      .filter((comment) => docxCommentText(comment))
      .map((comment) => ({
        body: structuredClone(comment.body),
        createdAt: timestamp(comment.createdAt),
        id: `word:${comment.id}`,
        userId: docxCommentUser(comment, users),
      }));

    if (!target || messages.length === 0) return;

    let savedRange: CommentsJSON['ranges'][number]['range'];

    try {
      const anchor = editor.anchor(target.range, {
        association: 'inward',
        deletion: 'nearest',
      });

      try {
        savedRange = editor.anchor.save(anchor);
      } finally {
        anchor.release();
      }
    } catch {
      return;
    }

    const userId = docxCommentUser(root, users);
    const createdAt = timestamp(root.createdAt);
    const id = `word:${root.id}`;

    threads.push(
      Object.freeze({
        createdAt,
        excerpt: editor.read.text.string(target.range),
        id,
        messages: Object.freeze(messages),
        resolution:
          root.resolved === true
            ? Object.freeze({ resolvedAt: null, userId: null })
            : null,
        status: 'published',
        target: Object.freeze({ type: 'range' }),
        userId,
      })
    );
    ranges.push(Object.freeze({ range: savedRange, threadId: id }));
    imported += messages.length;
  });

  return Object.freeze({
    comments: Object.freeze({
      kind: 'plate-comments' as const,
      ranges: Object.freeze(ranges),
      threads: Object.freeze(threads),
      version: 1 as const,
    }),
    imported,
    skipped: source.length - imported,
    users: Object.freeze(users),
  });
};

export function ImportToolbarButton({
  onImport,
  plugins,
}: {
  onImport: (editor: Editor) => void;
  plugins: readonly BasePluginInput[];
}) {
  const editor = useEditor();
  const model = useModelEditor();
  const [open, setOpen] = React.useState(false);
  const docxSource = useDocxSource();
  const markdownApi = editor.plugin(MarkdownPlugin).api;
  const commentsInstalled = editor.plugin(CommentsPlugin).installed;
  const createImportedEditor = (initialValue: EditorDocumentValue) => {
    const importedEditor = createEditor({
      initialValue,
      plugins,
      userId: model.userId,
    });

    if (commentsInstalled) {
      const currentComments = model.plugin(CommentsPlugin);

      importedEditor.plugin(CommentsPlugin).store.set({
        users: currentComments.store.get('users'),
      });
    }

    return importedEditor;
  };

  const { openFilePicker: openMdFilePicker } = useFilePicker({
    accept: ['.md', '.mdx'],
    multiple: false,
    onFilesSelected: async ({ plainFiles }: { plainFiles: File[] }) => {
      const text = await plainFiles[0].text();
      const result = markdownApi.parse(text);

      if (!result.ok) {
        toast.error(
          result.diagnostics.find(({ severity }) => severity === 'error')
            ?.message ?? 'The Markdown document could not be imported.'
        );

        return;
      }

      onImport(createImportedEditor(result.document));
      docxSource?.replaceSource(null);
      toastWarnings(result.diagnostics);
    },
  });

  const { openFilePicker: openHtmlFilePicker } = useFilePicker({
    accept: ['text/html'],
    multiple: false,
    onFilesSelected: async ({ plainFiles }: { plainFiles: File[] }) => {
      const text = await plainFiles[0].text();
      const result = editor.api.html.parse(text);

      if (!result.ok) {
        toast.error(
          result.diagnostics.find(({ severity }) => severity === 'error')
            ?.message ?? 'The HTML document could not be imported.'
        );

        return;
      }

      onImport(createImportedEditor(result.document));
      docxSource?.replaceSource(null);
      toastWarnings(result.diagnostics);
    },
  });

  const { openFilePicker: openDocxFilePicker } = useFilePicker({
    accept: ['.docx'],
    multiple: false,
    onFilesSelected: async ({ plainFiles }: { plainFiles: File[] }) => {
      const [{ importDocx }, arrayBuffer] = await Promise.all([
        import('platejs/docx/import'),
        plainFiles[0].arrayBuffer(),
      ]);
      const result = await importDocx(arrayBuffer, {
        plugins,
        retainSource: docxSource !== null,
      });

      if (!result.ok) {
        toast.error(
          result.diagnostics.find(({ severity }) => severity === 'error')
            ?.message ?? 'The Word document could not be imported.'
        );

        return;
      }

      let adopted: ReturnType<typeof importDocxComments> | null = null;
      let importedEditor: Editor;

      try {
        importedEditor = createImportedEditor(result.document);

        if (commentsInstalled) {
          adopted = importDocxComments(importedEditor, result.comments);

          const comments = importedEditor.plugin(CommentsPlugin);

          comments.api.replace(adopted.comments);
          comments.store.set({
            users: { ...comments.store.get('users'), ...adopted.users },
          });
        }
      } catch {
        if ('source' in result) result.source?.dispose();
        toast.error(
          'The Word document and its comments could not be imported.'
        );

        return;
      }

      onImport(importedEditor);
      if (docxSource && 'source' in result) {
        docxSource.replaceSource(result.source);
      }

      toastWarnings(result.diagnostics);
      const imported = adopted?.imported ?? 0;
      const skipped = commentsInstalled
        ? (adopted?.skipped ?? result.comments.length)
        : result.comments.length;

      if (imported > 0) {
        toast.success(
          `Imported ${imported} Word comment${imported === 1 ? '' : 's'}.`
        );
      }
      if (skipped > 0) {
        toast.warning(
          commentsInstalled
            ? `${skipped} Word comment${skipped === 1 ? '' : 's'} could not be attached.`
            : `${skipped} Word comment${skipped === 1 ? '' : 's'} require the Comments plugin.`
        );
      }
    },
  });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger>
        <ToolbarButton
          aria-label="Import"
          pressed={open}
          tooltip="Import"
          isDropdown
        >
          <ArrowUpToLineIcon className="size-4" />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() => {
              openHtmlFilePicker();
            }}
          >
            Import from HTML
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => {
              openMdFilePicker();
            }}
          >
            Import from Markdown
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => {
              openDocxFilePicker();
            }}
          >
            Import from Word
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
