import React, { useCallback, useMemo, useState } from 'react';
import { createEditor, Editor, Range } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, RenderElementProps, Slate, withReact } from 'slate-react';
import { defineSchema } from 'slate-schema';
import { initialValue } from './config';

const withSchema = defineSchema([
  {
    for: 'node',
    match: 'editor',
    validate: {
      children: [
        { match: [{ type: 'title' }], min: 1, max: 1 },
        { match: [{ type: 'paragraph' }], min: 1 },
      ],
    },
    normalize: (editor, error) => {
      const { code, path } = error;
      const [index] = path;
      const type = index === 0 ? 'title' : 'paragraph';

      switch (code) {
        case 'child_invalid': {
          Editor.setNodes(editor, { type }, { at: path });
          break;
        }
        case 'child_min_invalid': {
          const block = { type, children: [{ text: '' }] };
          Editor.insertNodes(editor, block, { at: path });
          break;
        }
        case 'child_max_invalid': {
          Editor.setNodes(editor, { type }, { at: path });
          break;
        }
        default:
          break;
      }
    },
  },
]);

const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'title':
      return <h2 {...attributes}>{children}</h2>;
    case 'paragraph':
      return <p {...attributes}>{children}</p>;
    default:
      return <div {...attributes}>{children}</div>;
  }
};

export const ForcedLayout = () => {
  const [value, setValue] = useState(initialValue);
  const [selection, setSelection] = useState<Range | null>(null);
  const renderElement = useCallback(props => <Element {...props} />, []);
  const editor = useMemo(
    () => withSchema(withHistory(withReact(createEditor()))),
    []
  );

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
      <Editable
        renderElement={renderElement}
        placeholder="Enter a title…"
        spellCheck
        autoFocus
      />
    </Slate>
  );
};
