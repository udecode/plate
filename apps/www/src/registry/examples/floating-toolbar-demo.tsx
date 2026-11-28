'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';

import { DiscussionKit } from '@/registry/components/editor/discussion';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';
import { UserDirectoryProvider } from '@/registry/components/editor/user-directory';

import { floatingToolbarValue } from './values/floating-toolbar-value';

const FLOATING_TOOLBAR_USERS = { local: { id: 'local', name: 'You' } };

export default function FloatingToolbarDemo() {
  const editor = useCreateEditor({
    plugins: [...EditorKit, ...DiscussionKit],
    initialValue: floatingToolbarValue,
  });

  return (
    <UserDirectoryProvider initialUsers={FLOATING_TOOLBAR_USERS}>
      <EditorRoot editor={editor}>
        <EditorFrame className="h-[650px]">
          <EditorContainer>
            <Editor />
          </EditorContainer>
        </EditorFrame>
      </EditorRoot>
    </UserDirectoryProvider>
  );
}
