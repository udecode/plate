'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { DndKit } from '@/registry/components/editor/dnd';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';

function DndPerfEditor({ blocks }: { blocks: number }) {
  const editor = useCreateEditor({
    initialValue: Array.from({ length: blocks }, (_, index) => ({
      children: [{ text: `Block ${index}` }],
      type: 'paragraph',
    })),
    plugins: [...BasicBlocksKit, ...DndKit],
  });

  return (
    <EditorRoot editor={editor}>
      <EditorContainer className="h-[600px] overflow-auto" data-dnd-perf>
        <Editor className="p-4 pl-12" variant="none" />
      </EditorContainer>
    </EditorRoot>
  );
}

export default function DndPerfPage() {
  const [blocks, setBlocks] = React.useState<number | null>(null);

  React.useEffect(() => {
    const value = Number(
      new URLSearchParams(window.location.search).get('blocks')
    );

    // oxlint-disable-next-line react/set-state-in-effect -- [P1 local-invariant] The benchmark editor renders client-only after mount, so no hydration runs inside a measured drag.
    setBlocks(Number.isSafeInteger(value) && value > 0 ? value : 1000);
  }, []);

  return blocks === null ? null : <DndPerfEditor blocks={blocks} />;
}
