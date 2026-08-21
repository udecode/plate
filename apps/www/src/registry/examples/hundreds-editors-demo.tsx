'use client';

import type { Value } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';
import * as React from 'react';

import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { createMultiEditorsValue } from '@/registry/examples/values/multi-editors-value';

const values = createMultiEditorsValue();

function WithPlate({ id, value }: { id: string; value: Value }) {
  const editor = usePlateEditor({
    id,
    // components: PlateUI,
    // plugins: [...BasicBlocksKit, ...BasicMarksKit],
    initialValue: value,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor spellCheck={false} />
      </EditorContainer>
    </Plate>
  );
}

export default function HundredsEditorsDemo() {
  return (
    <div className="flex flex-col">
      {values.map((value, idx) => (
        <div key={idx} className="p-10">
          <h3 className="mb-2 font-semibold">#{idx + 1}</h3>
          <WithPlate id={String(idx + 1)} value={value} />
        </div>
      ))}
    </div>
  );
}
