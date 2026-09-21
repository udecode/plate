'use client';

import { NodeApi, NormalizeTypesPlugin, TextApi } from 'platejs';
import type { CommentsJSON } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import { createEditor, EditorRoot } from 'platejs/react';
import * as React from 'react';

import { useLocale } from '@/hooks/useLocale';
import { getI18nValues } from '@/i18n/getI18nValues';
import { CodeDrawingKit } from '@/registry/components/editor/code-drawing';
import { createCommentValue } from '@/registry/components/editor/comment';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { ExcalidrawKit } from '@/registry/components/editor/excalidraw';
import { EditorKit } from '@/registry/components/editor/plugins';
import { createEphemeralUploadKit } from '@/registry/components/editor/upload/ephemeral';

export default function PlaygroundDemo({
  id,
  className,
}: {
  id?: string;
  className?: string;
}) {
  const locale = useLocale();
  const value = React.useMemo(() => getI18nValues(locale).playground, [locale]);
  const [createdAt] = React.useState(() => Date.now());
  const session = React.useMemo(() => {
    const ephemeralUploads = createEphemeralUploadKit();
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
    const suggestionOffset = leadingText.text.length;

    const sentenceText = sentence.text.replace(addedText, '');
    const discussionText = discussionTail.text.replace(overlapText, '');
    const baseline = {
      ...initialValue,
      children: initialValue.children.map((node, index) =>
        index === 3
          ? {
              ...paragraph,
              children: [
                { ...leadingText, text: leadingText.text + sentenceText },
                ...paragraph.children
                  .slice(3)
                  .map((child, childIndex) =>
                    childIndex === 1
                      ? { ...discussionTail, text: discussionText }
                      : child
                  ),
              ],
            }
          : node
      ),
    };

    const plugins = [
      ...EditorKit,
      ...DiscussionKit,
      CommentsPlugin.configure({
        initialState: {
          currentUserId: 'alice',
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
      ...CodeDrawingKit,
      ...ExcalidrawKit,
      NormalizeTypesPlugin.configure({
        enabled: id === 'forced-layout',
        initialState: {
          rules: [{ path: [0], strictType: 'h1' }],
        },
      }),
      ...ephemeralUploads.plugins,
    ];
    const current = createEditor({
      plugins,
      userId: 'alice',
      initialValue: baseline,
    });

    current.update((tx) => {
      tx.history.skip();
      tx.authored.propose();
      tx.nodes.insert([suggestion, { text: addedText }], {
        at: { offset: suggestionOffset, path: [3, 0] },
      });
    });
    current.runtime.userId = 'bob';
    current.update((tx) => {
      const offset = addedText.length + sentenceText.indexOf(deletedText);

      tx.history.skip();
      tx.authored.propose();
      tx.text.delete({
        at: {
          anchor: { offset, path: [3, 2] },
          focus: { offset: offset + deletedText.length, path: [3, 2] },
        },
      });
    });
    current.runtime.userId = 'charlie';
    let overlapChangeId = '';
    current.update((tx) => {
      tx.history.skip();
      overlapChangeId = tx.authored.propose();
      tx.text.insert(overlapText, {
        at: { offset: overlapOffset, path: [3, 4] },
      });
    });
    current.runtime.userId = 'alice';
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
    const anchor = current.anchor(
      {
        anchor: { path: [3, 1, 0], offset: 0 },
        focus: {
          path: [3, 2],
          offset: discussionText.indexOf(locale === 'cn' ? '。' : '.'),
        },
      },
      { association: 'inward', deletion: 'nearest' }
    );
    const comments: CommentsJSON = {
      kind: 'plate-comments',
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

    return { dispose: ephemeralUploads.dispose, editor };
  }, [createdAt, id, locale, value]);
  React.useEffect(() => session.dispose, [session]);
  const { editor } = session;

  return (
    <EditorRoot
      editor={editor}
      key={editor.id}
      authored={{ intent: 'edit', projection: 'markup' }}
    >
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
