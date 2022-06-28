export const hugeDocumentAppCode = `import React, { useCallback, useMemo, useState } from 'react';
import { Plate, TElement } from '@udecode/plate';
import { createEditor } from 'slate';
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  Slate,
  withReact,
} from 'slate-react';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { createHugeDocumentValue } from './huge-document/createHugeDocumentValue';
import { MyValue } from './typescript/plateTypes';

const initialValue = createHugeDocumentValue() as MyValue;

const WithPlate = () => (
  <Plate
    editableProps={editableProps}
    initialValue={initialValue}
    plugins={basicNodesPlugins}
  />
);

const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch ((element as TElement).type) {
    case 'h1':
      return <h1 {...attributes}>{children}</h1>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const WithoutPlate = () => {
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
};

export default () => (
  <div className="flex">
    <WithPlate />
    <WithoutPlate />
  </div>
);
`;

export const hugeDocumentAppFile = {
  '/HugeDocumentApp.tsx': hugeDocumentAppCode,
};
