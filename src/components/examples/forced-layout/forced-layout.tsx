import React, { useCallback, useMemo } from 'react';
import { createEditor, Editor } from 'slate';
import { withHistory } from 'slate-history';
import { RenderElementProps, withReact } from 'slate-react';
import { Editable, Slate } from 'slate-react-next';
import { NodeError, NodeRule, withSchema } from 'slate-schema';
import { initialValue } from './config';

const schema: NodeRule[] = [
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
      const { code, path, index } = error as NodeError & { index: number };
      const type = index === 0 ? 'title' : 'paragraph';

      switch (code) {
        case 'child_invalid': {
          Editor.setNodes(editor, { type }, { at: path });
          break;
        }
        case 'child_min_invalid': {
          const block = { type, children: [{ text: '', marks: [] }] };
          Editor.insertNodes(editor, block, { at: path.concat(index) });
          break;
        }
        case 'child_max_invalid': {
          Editor.setNodes(editor, { type }, { at: path.concat(index) });
          break;
        }
        default:
          break;
      }
    },
  },
];

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
  const renderElement = useCallback(props => <Element {...props} />, []);
  const editor = useMemo(
    () => withSchema(withHistory(withReact(createEditor())), schema),
    []
  );
  return (
    <Slate editor={editor} defaultValue={initialValue}>
      <Editable
        renderElement={renderElement}
        placeholder="Enter a title…"
        spellCheck
        autoFocus
      />
    </Slate>
  );
};
