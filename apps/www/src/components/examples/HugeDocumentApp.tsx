import React, { useCallback, useMemo, useState } from 'react';
import { Plate, TElement } from '@udecode/plate';
import { createEditor } from 'slate';
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  Slate,
  withReact,
} from 'slate-react';

import { editableProps } from '@/plate/demo/editableProps';
import { MyValue } from '@/plate/demo/plate.types';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { createHugeDocumentValue } from '@/plate/demo/values/createHugeDocumentValue';

const initialValue = createHugeDocumentValue() as MyValue;

function WithPlate() {
  return (
    <Plate
      editableProps={editableProps}
      initialValue={initialValue}
      plugins={basicNodesPlugins}
    />
  );
}

function Element({ attributes, children, element }: RenderElementProps) {
  switch ((element as TElement).type) {
    case 'h1':
      return <h1 {...attributes}>{children}</h1>;
    default:
      return <p {...attributes}>{children}</p>;
  }
}

function WithoutPlate() {
  const [value, setValue] = useState(initialValue);
  const renderElement = useCallback((p) => <Element {...p} />, []);
  const editor = useMemo(() => withReact(createEditor() as ReactEditor), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={useCallback((v) => setValue(v), [])}
    >
      <Editable renderElement={renderElement} {...(editableProps as any)} />
    </Slate>
  );
}

export default function HugeDocumentApp() {
  return (
    <div className="flex">
      <WithPlate />
      <WithoutPlate />
    </div>
  );
}
