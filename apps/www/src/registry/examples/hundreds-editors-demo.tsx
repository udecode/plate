'use client';

import type { Value } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';
import * as React from 'react';

import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { createMultiEditorsValue } from '@/registry/examples/values/multi-editors-value';

const editors = createMultiEditorsValue().map((value, index) => ({
  id: String(index + 1),
  value,
}));

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
      {editors.map(({ id, value }) => (
        <div key={id} className="p-10">
          <h3 className="mb-2 font-semibold">#{id}</h3>
          <WithPlate id={id} value={value} />
        </div>
      ))}
    </div>
  );
}
