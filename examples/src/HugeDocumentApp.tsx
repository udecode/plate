import React, { useCallback, useMemo, useState } from 'react';
import { Plate } from '@udecode/plate';
import { TElement } from '@udecode/plate-core/src/index';
import { createEditor } from 'slate';
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  Slate,
  withReact,
} from 'slate-react';
import { basicNodesPlugins } from './basic-elements/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { createHugeDocumentValue } from './huge-document/createHugeDocumentValue';
import { MyValue } from './typescript/plateTypes';

const initialValue = createHugeDocumentValue() as MyValue;

const WithPlate = () => (
  <Plate
    id="huge-document"
    editableProps={{
      ...editableProps,
      // spellcheck adds some lag so we disable it
      spellCheck: false,
    }}
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
