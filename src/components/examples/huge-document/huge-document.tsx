import React, { useCallback, useMemo, useState } from 'react';
import { createEditor, Range } from 'slate';
import { Editable, RenderElementProps, Slate, withReact } from 'slate-react';
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
  const [value, setValue] = useState(initialValue);
  const [selection, setSelection] = useState<Range | null>(null);
  const renderElement = useCallback(props => <Element {...props} />, []);
  const editor = useMemo(() => withReact(createEditor()), []);
  return (
    <Slate
      editor={editor}
      value={value}
      selection={selection}
      onChange={(newValue, newSelection) => {
        setValue(newValue);
        setSelection(newSelection);
      }}
    >
      <Editable renderElement={renderElement} spellCheck autoFocus />
    </Slate>
  );
};
