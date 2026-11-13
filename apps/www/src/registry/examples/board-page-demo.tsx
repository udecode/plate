'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';

import { AutoformatKit } from '@/registry/components/editor/autoformat';
import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { BasicMarksKit } from '@/registry/components/editor/basic-marks';
import { BoardPageKit } from '@/registry/components/editor/board';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { LinkKit } from '@/registry/components/editor/link';
import { ListKit } from '@/registry/components/editor/list';
import { boardValue } from '@/registry/examples/values/board-value';

export default function BoardPageDemo() {
  const editor = useCreateEditor({
    plugins: [
      ...BasicBlocksKit,
      ...BasicMarksKit,
      ...ListKit,
      ...LinkKit,
      ...AutoformatKit,
      ...BoardPageKit,
    ],
    initialValue: {
      children: [
        {
          childRoots: { shapes: 'board:demo' },
          children: [{ text: '' }],
          type: 'board',
        },
      ],
      roots: { 'board:demo': boardValue.roots['board:demo'] },
    },
  });

  return (
    <EditorRoot editor={editor}>
      <EditorFrame>
        <EditorContainer>
          <Editor className="h-full" variant="none" />
        </EditorContainer>
      </EditorFrame>
    </EditorRoot>
  );
}
