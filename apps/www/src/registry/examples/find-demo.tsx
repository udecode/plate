'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
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
      <EditorRoot editor={editor}>
        <EditorFrame className="h-[650px]">
          <EditorContainer aria-label="First view" role="region">
            <Editor aria-label="First editor" />
          </EditorContainer>
        </EditorFrame>
      </EditorRoot>
      <Button onClick={() => setSecondView(!secondView)} variant="outline">
        {secondView ? 'Hide second view' : 'Show second view'}
      </Button>
      {secondView && (
        <EditorRoot editor={editor}>
          <EditorFrame className="h-[650px]">
            <EditorContainer aria-label="Second view" role="region">
              <Editor aria-label="Second editor" />
            </EditorContainer>
          </EditorFrame>
        </EditorRoot>
      )}
    </div>
  );
}
