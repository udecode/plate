'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { ColumnKit } from '@/registry/components/editor/column';
import { DndKit } from '@/registry/components/editor/dnd';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

// With columns, a full group of five sits after Block 9, so its cells refuse
// one more column.
function DndPerfEditor({
  blocks,
  columns,
}: {
  blocks: number;
  columns: boolean;
}) {
  const value = Array.from({ length: blocks }, (_, index) =>
    paragraph(`Block ${index}`)
  );
  const editor = useCreateEditor({
    initialValue: columns
      ? [
          ...value.slice(0, 10),
          {
            children: Array.from({ length: 5 }, (_, index) => ({
              children: [paragraph(`Cell ${index}`)],
              type: 'column',
              width: '20%',
            })),
            type: 'columnGroup',
          },
          ...value.slice(10),
        ]
      : value,
    plugins: [...BasicBlocksKit, ...DndKit, ...(columns ? ColumnKit : [])],
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
  const [options, setOptions] = React.useState<{
    blocks: number;
    columns: boolean;
  } | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const value = Number(params.get('blocks'));

    // oxlint-disable-next-line react/set-state-in-effect -- [P1 local-invariant] The benchmark editor renders client-only after mount, so no hydration runs inside a measured drag.
    setOptions({
      blocks: Number.isSafeInteger(value) && value > 0 ? value : 1000,
      columns: params.has('columns'),
    });
  }, []);

  return options === null ? null : <DndPerfEditor {...options} />;
}
