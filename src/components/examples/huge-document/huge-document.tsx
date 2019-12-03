import React, { useCallback, useMemo } from 'react';
import { createEditor } from 'slate';
import { RenderElementProps, withReact } from 'slate-react';
import { Editable, Slate } from 'slate-react-next';
import { initialValue } from './config';

const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'heading':
      return <h1 {...attributes}>{children}</h1>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

export const HugeDocument = () => {
  const renderElement = useCallback(props => <Element {...props} />, []);
  const editor = useMemo(() => withReact(createEditor()), []);
  return (
    <Slate editor={editor} defaultValue={initialValue}>
      <Editable renderElement={renderElement} spellCheck autoFocus />
    </Slate>
  );
};
