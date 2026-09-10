'use client';

import { NodeApi, NormalizeTypesPlugin } from 'platejs';
import { CommentsPlugin } from 'platejs/comments/react';
import { Plate, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { useLocale } from '@/hooks/useLocale';
import { getI18nValues } from '@/i18n/getI18nValues';
import { CodeDrawingKit } from '@/registry/components/editor/code-drawing';
import { createCommentValue } from '@/registry/components/editor/comment';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { ExcalidrawKit } from '@/registry/components/editor/excalidraw';
import { EditorKit } from '@/registry/components/editor/plugins';

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

  const editor = useCreateEditor(
    {
      plugins: [
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
                avatarUrl:
                  'https://api.dicebear.com/9.x/glass/svg?seed=charlie2',
              },
            },
            initialThreads: [
              {
                id: 'discussion1',
                createdAt: new Date(createdAt).toISOString(),
                excerpt: 'comments',
                userId: 'charlie',
                resolved: false,
                status: 'published',
                target: {
                  type: 'range',
                  range: {
                    anchor: { path: [3, 6, 0], offset: 0 },
                    focus: {
                      path: [3, 7],
                      offset: NodeApi.string(
                        NodeApi.get(
                          { type: '', children: value.children },
                          [3, 8]
                        )
                      ).length,
                    },
                  },
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
                resolved: false,
                status: 'published',
                target: {
                  type: 'range',
                  range: {
                    anchor: { path: [3, 8], offset: 0 },
                    focus: {
                      path: [3, 8],
                      offset: NodeApi.string(
                        NodeApi.get(
                          { type: '', children: value.children },
                          [3, 10]
                        )
                      ).length,
                    },
                  },
                },
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
            ],
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
      ],
      initialValue: value,
    },
    [id, locale]
  );
  return (
    <Plate editor={editor}>
      <EditorContainer className={className}>
        <Editor
          variant="demo"
          className="pb-[20vh]"
          placeholder="Type something..."
          spellCheck={false}
        />
      </EditorContainer>
    </Plate>
  );
}
