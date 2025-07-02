'use client';

import { useEffect, useState } from 'react';

import { usePlateViewEditor } from '@platejs/core/react';

import { BaseEditorKit } from '@/registry/components/editor/editor-base-kit';
import { playgroundValue } from '@/registry/examples/values/playground-value';
import { EditorView } from '@/registry/ui/editor';
import { EditorStatic } from '@/registry/ui/editor-static';

export default function DevPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // const editor = createStaticEditor({ plugins: BaseEditorKit });
  const editor = usePlateViewEditor(
    {
      plugins: BaseEditorKit,
      value: playgroundValue,
    },
    []
  );

  if (!isClient) {
    return <main>Loading...</main>;
  }

  return (
    <main>
      <EditorView editor={editor} />

      <h1>123</h1>

      <EditorStatic editor={editor} />
    </main>
  );
}
