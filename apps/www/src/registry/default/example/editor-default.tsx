'use client';

import { Plate } from '@udecode/plate-common/react';

import { editorPlugins } from '@/registry/default/components/editor/plugins/editor-plugins';
import { useCreateEditor } from '@/registry/default/components/editor/use-create-editor';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

export default function EditorDefault() {
  const editor = useCreateEditor({
    plugins: [...editorPlugins],
  });

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor placeholder="Type your message here." />
      </EditorContainer>
    </Plate>
  );
}
