'use client';

import { Plate } from '@udecode/plate-core/react';

import { useCreateEditor } from '@/registry/default/components/editor/use-create-editor';
import { linkValue } from '@/registry/default/example/values/link-value';
import { Button } from '@/registry/default/plate-ui/button';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

export function ClientComponent() {
  // console.log(linkValue, 'fj');

  const editor = useCreateEditor({
    value: linkValue,
  });

  const handleFileSelect = () => {
    const r = editor.api.html.deserialize({
      element: `<p><span>fj</span><br /> <span>fj</span></p>
      <p><span>fj</span></p>`,
    });
    console.log(r, 'result');
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <Button onClick={handleFileSelect}>Select HTML File</Button>
      <Plate editor={editor}>
        <EditorContainer>
          <Editor variant="demo" className="pb-[20vh]" spellCheck={false} />
        </EditorContainer>
      </Plate>
    </div>
  );
}
