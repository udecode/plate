'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';

import { DiscussionKit } from '@/registry/components/editor/discussion';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';
import { aiUser } from '@/registry/components/editor/use-chat';
import { UserDirectoryProvider } from '@/registry/components/editor/user-directory';

import { aiValue } from './values/ai-value';

const AI_DEMO_USERS = {
  local: { id: 'local', name: 'You' },
  [aiUser.id]: aiUser,
};

export default function AIDemo() {
  const editor = useCreateEditor({
    plugins: [...EditorKit, ...DiscussionKit],
    initialValue: aiValue,
  });

  return (
    <UserDirectoryProvider initialUsers={AI_DEMO_USERS}>
      <EditorRoot editor={editor} authored={{ intent: 'edit' }}>
        <EditorFrame className="h-[650px]">
          <EditorContainer>
            <Editor />
          </EditorContainer>
        </EditorFrame>
      </EditorRoot>
    </UserDirectoryProvider>
  );
}
