import React, { useCallback, useMemo, useState } from 'react';
import { editableProps } from '@/plate/demo/editableProps';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { createHugeDocumentValue } from '@/plate/demo/values/createHugeDocumentValue';
import { Plate, PlateContent, TElement } from '@udecode/plate-common';
import { createEditor } from 'slate';
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  Slate,
  withReact,
} from 'slate-react';

import { MyValue } from '@/types/plate-types';

const initialValue = createHugeDocumentValue() as MyValue;

function WithPlate() {
  return (
    <Plate initialValue={initialValue} plugins={basicNodesPlugins}>
      <PlateContent {...editableProps} />
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
  const [value, setValue] = useState(initialValue);
  const renderElement = useCallback((p) => <Element {...p} />, []);
  const editor = useMemo(() => withReact(createEditor() as ReactEditor), []);

  return (
    <Slate
      editor={editor}
      initialValue={value}
      onChange={useCallback((v) => setValue(v), [])}
    >
      <Editable renderElement={renderElement} {...(editableProps as any)} />
    </Slate>
  );
}

export default function HundredsBlocksDemo() {
  return (
    <div className="flex">
      <WithPlate />
      <WithoutPlate />
    </div>
  );
}
