'use client';

import { BaseHeadingPlugin } from 'platejs';
import type { CommentsJSON } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import {
  createPretextPageLayoutEngine,
  type NodeFragmentationProvider,
  type PageLayoutTypography,
} from 'platejs/pagination';
import {
  PagedEditorContent,
  type PagedEditableRenderPageProps,
  usePageLayout,
} from 'platejs/pagination/react';
import { createEditor, EditorRoot, useCreateEditor } from 'platejs/react';
import { BaseTablePlugin } from 'platejs/table';
import * as React from 'react';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { BasicMarksKit } from '@/registry/components/editor/basic-marks';
import { createCommentValue } from '@/registry/components/editor/comment';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import { DndKit } from '@/registry/components/editor/dnd';
import { LinkKit } from '@/registry/components/editor/link';
import { TableKit } from '@/registry/components/editor/table';

const plugins = [
  ...BasicBlocksKit,
  ...BasicMarksKit,
  ...TableKit,
  ...DndKit,
  ...LinkKit,
  ...DiscussionKit,
];

// The registry table renders 48 px rows inside 40 px of block padding.
const TABLE_ROW_HEIGHT = 48;
const TABLE_PADDING = 40;

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

const cell = (text: string, header = false) => ({
  children: [paragraph(text)],
  header,
  type: 'tableCell',
});

const value = [
  { children: [{ text: 'Paged documents' }], level: 1, type: 'heading' },
  {
    children: [
      { text: 'Every Plate plugin renders on pages: ' },
      { bold: true, text: 'bold marks' },
      { text: ', ' },
      { highlight: true, text: 'highlighted words' },
      { text: ' and ' },
      { code: true, text: 'inline code' },
      {
        text: ' keep their paint on lines you are not editing, while the page view measures every line with the same fonts the editor draws with. Read the ',
      },
      {
        children: [{ text: 'pagination guide' }],
        type: 'link',
        url: 'https://platejs.org/docs/pagination',
      },
      { text: '.' },
    ],
    type: 'paragraph',
  },
  { children: [{ text: 'Tables' }], level: 2, type: 'heading' },
  paragraph(
    'A table shorter than a page moves to the next page whole when it does not fit.'
  ),
  {
    children: [
      {
        children: [cell('Feature', true), cell('On pages', true)],
        type: 'tableRow',
      },
      ...[
        ['Marks and highlights', 'Painted inside each line'],
        ['Comments', 'Anchored to their text'],
        ['Drag handles', 'Beside their block'],
      ].map((row) => ({
        children: row.map((text) => cell(text)),
        type: 'tableRow',
      })),
    ],
    type: 'table',
  },
  ...Array.from({ length: 14 }, (_, index) =>
    paragraph(
      `Section ${index + 1}. Pages fill from top to bottom, and a paragraph that reaches the bottom margin continues on the next page. The caret, selection and typing work across that boundary like any other line in the document.`
    )
  ),
];

const commentText = 'highlighted words';

const fixture = createEditor({ initialValue: value, plugins });
const anchor = fixture.anchor(
  {
    anchor: { offset: 0, path: [1, 3] },
    focus: { offset: commentText.length, path: [1, 3] },
  },
  { association: 'inward', deletion: 'nearest' }
);
const initialComments: CommentsJSON = {
  kind: 'plate-comments',
  ranges: [{ range: fixture.anchor.save(anchor), threadId: 'paged-comment' }],
  threads: [
    {
      createdAt: '2026-10-06T12:00:00.000Z',
      excerpt: commentText,
      id: 'paged-comment',
      messages: [
        {
          body: createCommentValue('Comments keep their anchor on pages.'),
          createdAt: '2026-10-06T12:00:00.000Z',
          id: 'paged-comment-message',
          userId: 'ada',
        },
      ],
      resolution: null,
      status: 'published',
      target: { type: 'range' },
      userId: 'ada',
    },
  ],
  version: 1,
};
anchor.release();

const fontWeights: Record<number, number> = { 1: 700, 2: 600, 3: 600 };
const fontSizes: Record<number, [size: number, lineHeight: number]> = {
  1: [36, 40],
  2: [24, 32],
  3: [20, 28],
};

export default function PaginationDemo() {
  const editor = useCreateEditor({
    plugins: [
      ...plugins,
      CommentsPlugin.configure({
        initialState: {
          initialComments,
          users: { ada: { id: 'ada', name: 'Ada' } },
        },
      }),
    ],
    initialValue: value,
    userId: 'ada',
  });
  const surfaceRef = React.useRef<HTMLDivElement>(null);
  const editableRef = React.useRef<HTMLDivElement>(null);
  const layout = usePageLayout(editableRef);
  const [spread, setSpread] = React.useState(false);
  const [showLines, setShowLines] = React.useState(false);
  const [fontFamily, setFontFamily] = React.useState('sans-serif');
  const engine = React.useMemo(() => createPretextPageLayoutEngine(), []);

  React.useLayoutEffect(() => {
    const family = surfaceRef.current
      ? getComputedStyle(surfaceRef.current).fontFamily
      : '';

    if (family) setFontFamily(family);
  }, []);

  const headingType = editor.plugin(BaseHeadingPlugin).schema.type;
  const tableType = editor.plugin(BaseTablePlugin).schema.type;
  const typography = React.useMemo<PageLayoutTypography>(
    () => ({
      block: ({ element }) => {
        const level = Number(element.level ?? 0);

        return element.type === headingType
          ? {
              blockSpacing: 12,
              lineHeight: fontSizes[level]?.[1] ?? 28,
            }
          : { blockSpacing: 8, lineHeight: 24 };
      },
      text: ({ element, leaf }) => {
        const level = Number(element.level ?? 0);
        const size =
          element.type === headingType ? (fontSizes[level]?.[0] ?? 18) : 16;
        const weight =
          element.type === headingType
            ? (fontWeights[level] ?? 600)
            : leaf.bold
              ? 700
              : 400;

        return {
          font: `${leaf.italic ? 'italic ' : ''}${weight} ${size}px ${
            leaf.code ? 'ui-monospace, monospace' : fontFamily
          }`,
        };
      },
    }),
    [fontFamily, headingType]
  );
  const fragmentation = React.useMemo<NodeFragmentationProvider>(
    () =>
      ({ content, element }) =>
        element.type === tableType
          ? {
              size: {
                height:
                  element.children.length * TABLE_ROW_HEIGHT + TABLE_PADDING,
                width: content.width,
              },
              type: 'atomic',
            }
          : undefined,
    [tableType]
  );

  const renderPage = ({ attributes, page }: PagedEditableRenderPageProps) => (
    <div
      {...attributes}
      className="rounded-sm bg-background shadow-sm ring-1 ring-border"
    >
      {showLines &&
        layout?.fragments.flatMap((fragment) =>
          fragment.type === 'text' && fragment.pageIndex === page.index
            ? fragment.lines.flatMap((line, lineIndex) =>
                line.runs.map((run, runIndex) => (
                  <div
                    className="absolute outline-1 outline-emerald-500/60 outline-dotted"
                    data-path={fragment.path.join(',')}
                    data-testid="pagination-run-frame"
                    key={`${fragment.path.join(',')}:${lineIndex}:${runIndex}`}
                    style={{
                      height: run.rect.height,
                      left: run.rect.left,
                      top: run.rect.top,
                      width: run.rect.width,
                    }}
                  />
                ))
              )
            : []
        )}
    </div>
  );

  return (
    <div className="flex h-[720px] flex-col bg-muted/40">
      <div className="flex items-center gap-4 border-b px-4 py-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            checked={spread}
            onChange={(event) => setSpread(event.target.checked)}
            type="checkbox"
          />
          Spread pages
        </label>
        <label className="flex items-center gap-2">
          <input
            checked={showLines}
            onChange={(event) => setShowLines(event.target.checked)}
            type="checkbox"
          />
          Show measured lines
        </label>
        <output data-testid="pagination-page-count">
          {layout?.pages.length ?? 0} pages
        </output>
      </div>
      <div
        className="flex min-h-0 flex-1 justify-center overflow-auto py-6"
        ref={surfaceRef}
      >
        <EditorRoot editor={editor}>
          <PagedEditorContent
            aria-label="Paged document"
            className="px-16 pt-4 pb-72 text-base outline-none [&_strong]:font-bold"
            engine={engine}
            fragmentation={fragmentation}
            page={{ margins: 72, preset: 'letter' }}
            pageView={{ gap: 24, mode: spread ? 'spread' : 'single' }}
            ref={editableRef}
            renderPage={renderPage}
            typography={typography}
          />
        </EditorRoot>
      </div>
    </div>
  );
}
