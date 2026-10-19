'use client';

import { type Descendant, ElementApi, NodeApi, TextApi } from 'platejs';
import type { AuthoredMark } from 'platejs/authored';
import type { CommentsJSON } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import { CodeBlockPlugin, createEditor, EditorRoot } from 'platejs/react';
import * as React from 'react';

import { useLocale } from '@/hooks/useLocale';
import { getI18nValues } from '@/i18n/getI18nValues';
import {
  CodeBlockElement,
  createCodeBlockPlugin,
} from '@/registry/components/editor/code-block';
import { withDiagrams } from '@/registry/components/editor/code-block-diagram';
import { flowchartRenderer } from '@/registry/components/editor/code-block-diagram-flowchart';
import { graphvizRenderer } from '@/registry/components/editor/code-block-diagram-graphviz';
import { mermaidRenderer } from '@/registry/components/editor/code-block-diagram-mermaid';
import { createCommentValue } from '@/registry/components/editor/comment';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { ExcalidrawKit } from '@/registry/components/editor/excalidraw';
import { EditorKit } from '@/registry/components/editor/plugins';
import { createBrowserUploadKit } from '@/registry/components/editor/upload/browser';

const diagramCodeBlockPlugin = createCodeBlockPlugin(
  withDiagrams(CodeBlockElement, {
    renderers: [mermaidRenderer, graphvizRenderer, flowchartRenderer],
  })
);

// A suggestion's review mark on a node and everything inside it, as the
// authored plugin records an insertion or deletion.
const marked = <T extends Descendant>(node: T, mark: AuthoredMark): T => ({
  ...node,
  authored: [mark],
  ...(ElementApi.isElement(node)
    ? { children: node.children.map((child) => marked(child, mark)) }
    : {}),
});

export default function PlaygroundDemo({ className }: { className?: string }) {
  const locale = useLocale();
  const value = React.useMemo(() => getI18nValues(locale).playground, [locale]);
  const [createdAt] = React.useState(() => Date.now());
  const session = React.useMemo(() => {
    const browserUploads =
      process.env.NODE_ENV === 'production' ? createBrowserUploadKit() : null;
    const initialValue = structuredClone(value);
    const root = { children: initialValue.children, type: '' };
    const paragraph = NodeApi.get(root, [3]);
    const leadingText = NodeApi.get(root, [3, 0]);
    const suggestion = NodeApi.get(root, [3, 1]);
    const sentence = NodeApi.get(root, [3, 2]);
    const discussionTail = NodeApi.get(root, [3, 4]);
    const addedText =
      locale === 'cn' ? ' 像这样添加文本' : ' like this added text';
    const deletedText =
      locale === 'cn' ? '标记要删除的文本' : 'mark text for removal';
    const overlapText = locale === 'cn' ? '重叠的' : 'overlapping ';

    if (
      !NodeApi.isElement(paragraph) ||
      !NodeApi.isElement(suggestion) ||
      !TextApi.isText(leadingText) ||
      !TextApi.isText(sentence) ||
      !TextApi.isText(discussionTail)
    ) {
      throw new Error('Invalid playground suggestion fixture.');
    }

    const overlapOffset = discussionTail.text.indexOf(overlapText);

    const mark = (
      change: string,
      author: string,
      age: number,
      kind: 'delete' | 'insert'
    ): AuthoredMark => ({ at: createdAt - age, author, change, kind });
    const added = mark('playground1', 'alice', 900_000, 'insert');
    const removed = mark('playground2', 'bob', 800_000, 'delete');
    const overlapChangeId = 'playground3';
    const overlapped = mark(overlapChangeId, 'charlie', 700_000, 'insert');
    const addedStart = sentence.text.indexOf(addedText);
    const addedEnd = addedStart + addedText.length;
    const removedStart = sentence.text.indexOf(deletedText);
    const removedEnd = removedStart + deletedText.length;
    const pieces = (
      text: typeof sentence,
      cuts: ReadonlyArray<
        readonly [start: number, end: number, mark: AuthoredMark | null]
      >
    ) =>
      cuts.flatMap(([start, end, pieceMark]) => {
        const piece = { ...text, text: text.text.slice(start, end) };

        if (!piece.text) return [];
        return [pieceMark ? marked(piece, pieceMark) : piece];
      });
    const review = {
      ...initialValue,
      children: initialValue.children.map((node, index) =>
        index === 3
          ? {
              ...paragraph,
              children: [
                leadingText,
                marked(suggestion, added),
                ...pieces(sentence, [
                  [0, addedStart, null],
                  [addedStart, addedEnd, added],
                  [addedEnd, removedStart, null],
                  [removedStart, removedEnd, removed],
                  [removedEnd, sentence.text.length, null],
                ]),
                ...paragraph.children.slice(3, 4),
                ...pieces(discussionTail, [
                  [0, overlapOffset, null],
                  [
                    overlapOffset,
                    overlapOffset + overlapText.length,
                    overlapped,
                  ],
                  [
                    overlapOffset + overlapText.length,
                    discussionTail.text.length,
                    null,
                  ],
                ]),
                ...paragraph.children.slice(5),
              ],
            }
          : node
      ),
    };

    const plugins = [
      ...EditorKit.map((plugin) =>
        plugin.name === CodeBlockPlugin.name ? diagramCodeBlockPlugin : plugin
      ),
      ...DiscussionKit,
      CommentsPlugin.configure({
        initialState: {
          users: {
            alice: {
              id: 'alice',
              name: 'Alice',
              avatarUrl: 'https://api.dicebear.com/9.x/glass/svg?seed=alice6',
            },
            bob: {
              id: 'bob',
              name: 'Bob',
              avatarUrl: 'https://api.dicebear.com/9.x/glass/svg?seed=bob4',
            },
            charlie: {
              id: 'charlie',
              name: 'Charlie',
              avatarUrl: 'https://api.dicebear.com/9.x/glass/svg?seed=charlie2',
            },
          },
        },
      }),
      ...ExcalidrawKit,
      ...(browserUploads?.plugins ?? []),
    ];
    const current = createEditor({
      plugins,
      userId: 'alice',
      initialValue: review,
    });
    const threads: CommentsJSON['threads'] = [
      {
        id: 'discussion1',
        createdAt: new Date(createdAt).toISOString(),
        excerpt: 'comments',
        userId: 'charlie',
        resolution: null,
        status: 'published',
        target: {
          type: 'range',
        },
        messages: [
          {
            id: 'comment1',
            userId: 'charlie',
            createdAt: new Date(createdAt - 600_000).toISOString(),
            body: createCommentValue(
              'Comments are a great way to provide feedback and discuss changes.'
            ),
          },
          {
            id: 'comment2',
            userId: 'bob',
            createdAt: new Date(createdAt - 500_000).toISOString(),
            body: createCommentValue(
              'Agreed! The link to the docs makes it easy to learn more.'
            ),
          },
        ],
      },
      {
        id: 'discussion2',
        createdAt: new Date(createdAt).toISOString(),
        excerpt: 'overlapping',
        userId: 'bob',
        resolution: null,
        status: 'published',
        target: { id: overlapChangeId, type: 'change' },
        messages: [
          {
            id: 'comment1',
            userId: 'bob',
            createdAt: new Date(createdAt - 300_000).toISOString(),
            body: createCommentValue(
              'Nice demonstration of overlapping annotations with both comments and suggestions!'
            ),
          },
          {
            id: 'comment2',
            userId: 'charlie',
            createdAt: new Date(createdAt - 200_000).toISOString(),
            body: createCommentValue(
              'This helps users understand how powerful the editor can be.'
            ),
          },
        ],
      },
    ];
    const commented = review.children[3].children.indexOf(
      paragraph.children[3]
    );
    const anchor = current.anchor(
      {
        anchor: { path: [3, commented, 0], offset: 0 },
        focus: {
          path: [3, commented + 1],
          offset: discussionTail.text.indexOf(locale === 'cn' ? '。' : '.'),
        },
      },
      { association: 'inward', deletion: 'nearest' }
    );
    const comments: CommentsJSON = {
      kind: 'comments',
      version: 1,
      threads,
      ranges: [{ threadId: 'discussion1', range: current.anchor.save(anchor) }],
    };
    anchor.release();

    const editor = createEditor({
      plugins: [
        ...plugins,
        CommentsPlugin.configure({
          initialState: { initialComments: comments },
        }),
      ],
      userId: 'alice',
      initialValue: current.read.value(),
    });

    return { dispose: browserUploads?.dispose, editor };
  }, [createdAt, locale, value]);
  React.useEffect(() => session.dispose, [session]);
  const { editor } = session;

  return (
    <EditorRoot editor={editor} key={editor.id} authored={{ intent: 'edit' }}>
      <PlaygroundDemoContent className={className} />
    </EditorRoot>
  );
}

function PlaygroundDemoContent({ className }: { className?: string }) {
  return (
    <EditorFrame className={className}>
      <EditorContainer>
        <Editor
          variant="demo"
          className="pb-[20vh]"
          placeholder="Type something..."
          spellCheck={false}
        />
      </EditorContainer>
    </EditorFrame>
  );
}
