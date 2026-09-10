'use client';

import { Plate, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { FindKit } from '@/registry/components/editor/find';
import { EditorKit } from '@/registry/components/editor/plugins';
import { findValue } from '@/registry/examples/values/find-value';

export default function FindDemo() {
  const [secondView, setSecondView] = React.useState(false);
  const editor = useCreateEditor(
    {
      plugins: [...EditorKit, ...FindKit],
      initialValue: findValue,
    },
    []
  );

  return (
    <div className="space-y-4">
      <Plate editor={editor}>
        <EditorContainer aria-label="First view" role="region" variant="demo">
          <Editor aria-label="First editor" />
        </EditorContainer>
      </Plate>
      <Button onClick={() => setSecondView(!secondView)} variant="outline">
        {secondView ? 'Hide second view' : 'Show second view'}
      </Button>
      {secondView && (
        <Plate editor={editor}>
          <EditorContainer
            aria-label="Second view"
            role="region"
            variant="demo"
          >
            <Editor aria-label="Second editor" />
          </EditorContainer>
        </Plate>
      )}
    </div>
  );
}
