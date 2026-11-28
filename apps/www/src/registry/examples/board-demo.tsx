'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { BoardImageKit, BoardKit } from '@/registry/components/editor/board';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { FindKit } from '@/registry/components/editor/find';
import { EditorKit } from '@/registry/components/editor/plugins';
import { createBrowserUploadKit } from '@/registry/components/editor/upload/browser';
import { aiUser } from '@/registry/components/editor/use-chat';
import { UserDirectoryProvider } from '@/registry/components/editor/user-directory';
import { boardValue } from '@/registry/examples/values/board-value';

const BOARD_DEMO_USERS = {
  local: { id: 'local', name: 'You' },
  [aiUser.id]: aiUser,
};

export default function BoardDemo() {
  const [browserUploads] = React.useState(createBrowserUploadKit);
  const editor = useCreateEditor({
    plugins: [
      ...EditorKit,
      ...browserUploads.plugins,
      ...BoardKit,
      ...BoardImageKit,
      ...DiscussionKit,
      ...FindKit,
    ],
    initialValue: boardValue,
  });

  React.useEffect(() => browserUploads.dispose, [browserUploads]);

  return (
    <UserDirectoryProvider initialUsers={BOARD_DEMO_USERS}>
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
