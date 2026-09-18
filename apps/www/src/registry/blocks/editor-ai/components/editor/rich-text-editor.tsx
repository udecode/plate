'use client';

import { CommentsPlugin } from 'platejs/comments/react';
import { EditorRoot, useCreateEditor } from 'platejs/react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';
import { SettingsDialog } from '@/registry/components/editor/settings-dialog';

import {
  richTextEditorComments,
  richTextEditorValue,
} from './rich-text-editor-value';

export function RichTextEditor() {
  const editor = useCreateEditor({
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
              avatarUrl: 'https://api.dicebear.com/9.x/glass/svg?seed=charlie2',
            },
          },
          initialComments: richTextEditorComments,
        },
      }),
    ],
    userId: 'alice',
    initialValue: richTextEditorValue,
  });

  return (
    <TooltipProvider>
      <EditorRoot
        editor={editor}
        authored={{ intent: 'edit', projection: 'markup' }}
      >
        <EditorFrame>
          <EditorContainer>
            <Editor className="min-w-0" variant="demo" />
          </EditorContainer>
        </EditorFrame>
        <SettingsDialog />
      </EditorRoot>
    </TooltipProvider>
  );
}
