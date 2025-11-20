'use client';

import * as React from 'react';

import type { RenderElementProps, TElement, Value } from 'platejs';

import {
  BasicBlocksPlugin,
  BasicMarksPlugin,
} from '@platejs/basic-nodes/react';
import {
  ContentVisibilityChunk,
  Editable,
  Plate,
  Slate,
  usePlateEditor,
  withReact,
} from 'platejs/react';
import { createEditor } from 'slate';

import { createHugeDocumentValue } from '@/registry/examples/values/huge-document-value';
import { Editor, EditorContainer } from '@/registry/ui/editor';

const value = createHugeDocumentValue();

function WithPlate() {
  const editor = usePlateEditor({
    nodeId: false,
    plugins: [BasicBlocksPlugin, BasicMarksPlugin],
    value,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor spellCheck={false} />
      </EditorContainer>
    </Plate>
  );
}

function Element({ attributes, children, element }: RenderElementProps) {
  switch ((element as TElement).type) {
    case 'h1': {
      return <h1 {...attributes}>{children}</h1>;
    }
    default: {
      return <p {...attributes}>{children}</p>;
    }
  }
}

function WithoutPlate() {
  const [initialValue, setValue] = React.useState(value);
  const renderElement = React.useCallback((p: any) => <Element {...p} />, []);
  const editor = React.useMemo(() => {
    const e = withReact(createEditor());
    e.getChunkSize = (node) => (node === e ? 1000 : null);
    return e;
  }, []);
  const onChange = React.useCallback(
    (newValue: Value) => setValue(newValue),
    []
  );

  return (
    <Slate
      onChange={onChange as any}
      editor={editor}
      initialValue={initialValue}
    >
      <Editable
        renderChunk={ContentVisibilityChunk}
        renderElement={renderElement}
        spellCheck={false}
      />
    </Slate>
  );
}

export default function HundredsBlocksDemo() {
  return (
    <div className="flex">
      <div className="w-1/2 p-4">
        <div className="mb-4 font-bold text-lg">Plate</div>
        <WithPlate />
      </div>
      <div className="w-1/2 p-4">
        <div className="mb-4 font-bold text-lg">Slate</div>
        <WithoutPlate />
      </div>
    </div>
  );
}
