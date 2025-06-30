'use client';

import { useEffect, useState } from 'react';

import { PlateStatic } from '@platejs/core';
import { usePlateEditor } from 'platejs/react';

import { BaseEditorKit } from '@/registry/components/editor/editor-base-kit';
import { playgroundValue } from '@/registry/examples/values/playground-value';

export default function DevPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const editor = usePlateEditor(
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
      <PlateStatic editor={editor} />
    </main>
  );
}
