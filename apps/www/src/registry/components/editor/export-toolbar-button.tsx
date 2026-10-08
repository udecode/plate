'use client';

import { ArrowDownToLineIcon } from 'lucide-react';
import { createEditorView } from 'platejs';
import { AuthoredPlugin, isAuthoredEditor } from 'platejs/authored';
import { CommentsPlugin } from 'platejs/comments/react';
import { exportDocx, type DocxComment } from 'platejs/docx/export';
import { MarkdownPlugin } from 'platejs/markdown';
import { useEditor, useEditorSelector, useModelEditor } from 'platejs/react';
import { renderStaticHtml } from 'platejs/static';
import * as React from 'react';
import { toast } from 'sonner';

import { DOCX_EXPORT_STYLES } from '@/registry/components/editor/docx-export';
import { useDocxSource } from '@/registry/components/editor/docx-source';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/components/editor/dropdown-menu';
import { ToolbarButton } from '@/registry/components/editor/toolbar';

import { EditorStatic } from './editor-static';

type CleanProjection = 'accepted' | 'proposed';

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const absoluteCssUrls = (css: string, base: string) =>
  css.replaceAll(
    /url\((['"]?)([^'")]+)\1\)/g,
    (match, quote: string, url: string) =>
      url.startsWith('data:') || url.startsWith('#')
        ? match
        : `url(${quote}${new URL(url, base).href}${quote})`
  );

// Inline the app's own CSS so the file renders with the same styles without
// depending on a stylesheet URL that changes between deployments.
const readAppStyles = () =>
  Array.from(document.styleSheets, (sheet) => {
    try {
      const css = Array.from(sheet.cssRules, (rule) => rule.cssText).join('\n');

      return `<style>${absoluteCssUrls(css, sheet.href ?? document.baseURI)}</style>`;
    } catch {
      // Cross-origin rules are unreadable; keep the app's link instead.
      return sheet.href ? `<link rel="stylesheet" href="${sheet.href}" />` : '';
    }
  }).join('\n');

const toastWarnings = (
  diagnostics: ReadonlyArray<Readonly<{ severity: 'error' | 'warning' }>>
) => {
  const warningCount = diagnostics.filter(
    ({ severity }) => severity === 'warning'
  ).length;

  if (warningCount > 0) {
    toast.warning(
      `Exported with ${warningCount} warning${warningCount === 1 ? '' : 's'}.`
    );
  }
};

export function ExportToolbarButton() {
  const editor = useEditor();
  const model = useModelEditor();
  const commentsInstalled = editor.plugin(CommentsPlugin).installed;
  const docxSource = useDocxSource();
  const [open, setOpen] = React.useState(false);
  const [projectionChoice, setProjectionChoice] =
    React.useState<CleanProjection>();

  const authoredState = useEditorSelector((current) => {
    const authored = current.plugin(AuthoredPlugin);

    if (!authored.installed) return 'clean:proposed';

    const unresolved = (['pending', 'conflicted'] as const).some(
      (status) =>
        authored.read.changes({
          limit: 1,
          status,
        }).items.length > 0
    );

    return `${unresolved ? 'unresolved' : 'clean'}:${authored.read.view().projection}`;
  });
  const [authoredStatus, mountedProjection] = authoredState.split(':');
  const unresolved = authoredStatus === 'unresolved';
  const projection =
    projectionChoice ??
    (mountedProjection === 'accepted' ? 'accepted' : 'proposed');

  const exportToHtml = async () => {
    const result = await renderStaticHtml(model, {
      component: EditorStatic,
      projection,
      props: { style: { padding: '0 calc(50% - 350px)', paddingBottom: '' } },
    });

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${readAppStyles()}
  </head>
  <body class="${document.body.className}">
    ${result.data}
  </body>
</html>`;

    downloadBlob(new Blob([html], { type: 'text/html' }), 'plate.html');
    toastWarnings(result.diagnostics);
  };

  const exportToMarkdown = () => {
    const result = model.plugin(MarkdownPlugin).api.serialize({ projection });

    if (!result.ok) {
      toast.error(
        result.diagnostics.find(({ severity }) => severity === 'error')
          ?.message ?? 'Markdown export failed.'
      );

      return;
    }
    downloadBlob(
      new Blob([result.data], { type: 'text/markdown' }),
      'plate.md'
    );
    toastWarnings(result.diagnostics);
  };

  const exportToWord = async (
    requestedProjection?: CleanProjection | 'review'
  ) => {
    let omittedCommentCount = 0;
    const docxComments: DocxComment[] = [];

    if (commentsInstalled) {
      const commentEditor = isAuthoredEditor(model)
        ? createEditorView(model, {
            authored: { intent: 'edit', projection: 'proposed' },
          })
        : model;
      const comments = commentEditor.plugin(CommentsPlugin);
      const users = comments.store.get('users');

      comments.api.getThreads().forEach((thread) => {
        if (thread.status !== 'published') return;
        const attachment = comments.api.attachment(thread.id);

        if (attachment?.type !== 'range' || attachment.status !== 'attached') {
          omittedCommentCount += 1;

          return;
        }
        const parentId = thread.messages[0]
          ? `${thread.id}:${thread.messages[0].id}`
          : null;

        thread.messages.forEach((message, index) => {
          const user = users[message.userId];
          const name = user?.name ?? 'Unknown';
          const initials = name
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part[0])
            .join('')
            .slice(0, 4);

          docxComments.push({
            author: { ...(initials ? { initials } : {}), name },
            body: message.body,
            createdAt: message.createdAt,
            durableId: null,
            id: `${thread.id}:${message.id}`,
            parentId: index === 0 ? null : parentId,
            resolved: index === 0 ? thread.resolution !== null : null,
            target: { range: attachment.range },
          });
        });
      });
    }
    const wordProjection =
      requestedProjection ?? (unresolved ? projection : ('review' as const));
    const result = await exportDocx(model, {
      comments: docxComments,
      component: EditorStatic,
      // The download still completes; the toasts below report what was lost.
      lossPolicy: 'allow',
      projection: wordProjection,
      source: docxSource?.source,
      stylesheet: DOCX_EXPORT_STYLES,
    });

    if (!result.ok) {
      toast.error(
        result.diagnostics.find(({ severity }) => severity === 'error')
          ?.message ?? 'The Word document could not be exported.'
      );

      return;
    }

    downloadBlob(result.blob, 'plate.docx');
    toastWarnings(result.diagnostics);
    if (omittedCommentCount > 0) {
      toast.warning(
        `${omittedCommentCount} comment thread${omittedCommentCount === 1 ? '' : 's'} could not be attached to the Word document.`
      );
    }
  };

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) setProjectionChoice(undefined);
        setOpen(nextOpen);
      }}
      modal={false}
    >
      <DropdownMenuTrigger>
        <ToolbarButton
          aria-label="Export"
          pressed={open}
          tooltip="Export"
          isDropdown
        >
          <ArrowDownToLineIcon className="size-4" />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        {unresolved && (
          <>
            <DropdownMenuLabel>Unresolved suggestions</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={projection}
              onValueChange={(value) =>
                setProjectionChoice(
                  value === 'accepted' ? 'accepted' : 'proposed'
                )
              }
            >
              <DropdownMenuRadioItem
                value="proposed"
                onSelect={(event) => event.preventDefault()}
              >
                Include suggested changes
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="accepted"
                onSelect={(event) => event.preventDefault()}
              >
                Exclude suggested changes
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={exportToHtml}>
            Export as HTML
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={exportToMarkdown}>
            Export as Markdown
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => exportToWord()}>
            Export as Word
          </DropdownMenuItem>
          {unresolved && (
            <DropdownMenuItem onSelect={() => exportToWord('review')}>
              Export as Word with tracked changes
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
