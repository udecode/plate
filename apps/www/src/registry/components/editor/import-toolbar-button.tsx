'use client';

import { ArrowUpToLineIcon } from 'lucide-react';
import {
  createEditor,
  NodeApi,
  type BasePluginInput,
  type Editor,
  type EditorDocumentValue,
  type Range,
} from 'platejs';
import type { CommentThread } from 'platejs/comments';
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
import {
  type UserProfile,
  useUserDirectory,
} from '@/registry/components/editor/user-directory';

const plural = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? '' : 's'}`;

const toastLosses = <D extends Readonly<{ impact?: string; severity: string }>>(
  diagnostics: readonly D[],
  nameLoss: (
    diagnostic: D
  ) => Readonly<{ format?: boolean; name: string }> | undefined
) => {
  const dropped = new Set<string>();
  const formats = new Set<string>();
  let other = 0;

  for (const diagnostic of diagnostics) {
    if (diagnostic.severity !== 'warning' || diagnostic.impact === 'lossless') {
      continue;
    }

    const loss = nameLoss(diagnostic);

    if (loss) {
      (loss.format ? formats : dropped).add(
        loss.name.replaceAll(/-|(?=[A-Z])/g, ' ').toLowerCase()
      );
    } else {
      other += 1;
    }
  }

  const messages: string[] = [];

  if (dropped.size > 0) {
    messages.push(`Not imported: ${[...dropped].join(', ')}.`);
  }
  if (formats.size > 0) {
    messages.push(`Lost formatting: ${[...formats].join(', ')}.`);
  }
  if (other > 0) {
    messages.push(
      messages.length > 0
        ? `${plural(other, 'other warning')}.`
        : `Imported with ${plural(other, 'warning')}.`
    );
  }
  if (messages.length > 0) toast.warning(messages.join(' '));
};

const docxCommentText = (comment: DocxComment) =>
  comment.body
    .map((node) => NodeApi.string(node))
    .join('\n')
    .trim();

const docxCommentUser = (
  comment: DocxComment,
  users: Record<string, UserProfile>
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

  const users: Record<string, UserProfile> = {};
  const threads: CommentThread[] = [];
  const ranges: Record<string, Range> = {};
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

    let range: Range | null;

    try {
      const anchor = editor.anchor(target.range, {
        association: 'inward',
        deletion: 'nearest',
      });

      try {
        range = anchor.resolve();
      } finally {
        anchor.release();
      }
    } catch {
      return;
    }
    if (!range) return;

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
    ranges[id] = range;
    imported += messages.length;
  });

  return Object.freeze({
    comments: Object.freeze({
      ranges: Object.freeze(ranges),
      threads: Object.freeze(threads),
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
  const userDirectory = useUserDirectory();
  const markdownApi = editor.plugin(MarkdownPlugin).api;
  const commentsInstalled = editor.plugin(CommentsPlugin).installed;
  const createImportedEditor = (initialValue: EditorDocumentValue) =>
    createEditor({
      initialValue,
      plugins,
      userId: model.userId,
    });

  const { openFilePicker: openMdFilePicker } = useFilePicker({
    accept: ['.md', '.mdx'],
    multiple: false,
    onFilesSelected: async ({ plainFiles }: { plainFiles: File[] }) => {
      const text = await plainFiles[0].text();
      const result = markdownApi.parse(text, { lossPolicy: 'allow' });

      if (!result.ok) {
        toast.error(
          result.diagnostics.find(({ severity }) => severity === 'error')
            ?.message ?? 'The Markdown document could not be imported.'
        );

        return;
      }

      onImport(createImportedEditor(result.document));
      docxSource?.replaceSource(null);
      toastLosses(result.diagnostics, (diagnostic) =>
        diagnostic.code === 'markdown-unsupported-node' ||
        diagnostic.code === 'markdown-unsafe-content'
          ? { name: diagnostic.nodeType }
          : undefined
      );
    },
  });

  const { openFilePicker: openHtmlFilePicker } = useFilePicker({
    accept: ['text/html'],
    multiple: false,
    onFilesSelected: async ({ plainFiles }: { plainFiles: File[] }) => {
      const text = await plainFiles[0].text();
      const result = editor.api.html.parse(text, { lossPolicy: 'allow' });

      if (!result.ok) {
        toast.error(
          result.diagnostics.find(({ severity }) => severity === 'error')
            ?.message ?? 'The HTML document could not be imported.'
        );

        return;
      }

      onImport(createImportedEditor(result.document));
      docxSource?.replaceSource(null);
      toastLosses(result.diagnostics, (diagnostic) =>
        (diagnostic.code === 'html-unsafe-content' ||
          diagnostic.code === 'html-unsupported-content') &&
        diagnostic.kind === 'element' &&
        diagnostic.source?.tag
          ? { name: diagnostic.source.tag }
          : undefined
      );
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
        lossPolicy: 'allow',
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
        }
      } catch {
        if ('source' in result) result.source?.dispose();
        toast.error(
          'The Word document and its comments could not be imported.'
        );

        return;
      }

      const adoptedUsers = adopted?.users ?? {};
      const hasAdoptedUsers = Object.keys(adoptedUsers).length > 0;

      if (hasAdoptedUsers && userDirectory.writable) {
        userDirectory.mergeUsers(adoptedUsers);
      }

      onImport(importedEditor);
      if (docxSource && 'source' in result) {
        docxSource.replaceSource(result.source);
      }

      if (hasAdoptedUsers && !userDirectory.writable) {
        toast.warning(
          'Word comment author names could not be saved without a UserDirectoryProvider.'
        );
      }

      toastLosses(
        result.diagnostics.filter(
          (diagnostic) =>
            !('feature' in diagnostic) || diagnostic.feature !== 'comment-range'
        ),
        (diagnostic) =>
          'feature' in diagnostic && diagnostic.feature
            ? {
                format: diagnostic.code === 'property-dropped',
                name: diagnostic.feature,
              }
            : undefined
      );
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
        <ToolbarButton pressed={open} tooltip="Import" isDropdown>
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
