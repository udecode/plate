'use client';

import React, { useCallback, useMemo, useState } from 'react';

import type { TElement, Value } from '@udecode/plate-common';

import { BasicElementsPlugin } from '@udecode/plate-basic-elements/react';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks/react';
import { Plate, usePlateEditor } from '@udecode/plate-common/react';
import { createEditor } from 'slate';
import {
  type ReactEditor,
  type RenderElementProps,
  Editable,
  Slate,
  withReact,
} from 'slate-react';

import { PlateUI } from '@/plate/demo/plate-ui';
import { createHugeDocumentValue } from '@/registry/default/example/values/huge-document-value';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

const value = createHugeDocumentValue();

function WithPlate() {
  const editor = usePlateEditor({
    override: { components: PlateUI },
    plugins: [BasicElementsPlugin, BasicMarksPlugin],
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
  const [initialValue, setValue] = useState(value);
  const renderElement = useCallback((p: any) => <Element {...p} />, []);
  const editor = useMemo(() => withReact(createEditor() as ReactEditor), []);
  const onChange = useCallback((newValue: Value) => setValue(newValue), []);

  return (
    <Slate
      onChange={onChange as any}
      editor={editor}
      initialValue={initialValue}
    >
      <Editable renderElement={renderElement} spellCheck={false} />
    </Slate>
  );
}

export default function HundredsBlocksDemo() {
  return (
    <div className="flex">
      <div className="w-1/2 p-4">
        <div className="mb-4 text-lg font-bold">Plate</div>
        <WithPlate />
      </div>
      <div className="w-1/2 p-4">
        <div className="mb-4 text-lg font-bold">Slate</div>
        <WithoutPlate />
      </div>
    </div>
  );
}
