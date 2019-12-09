import React, { useMemo, useState } from 'react';
import { createEditor, Editor, Range } from 'slate';
import {
  Editable,
  RenderElementProps,
  Slate,
  useEditor,
  useFocused,
  useSelected,
  withReact,
} from 'slate-react';
import { initialValue } from './config';

const withEmbeds = (editor: Editor) => {
  const { isVoid } = editor;
  editor.isVoid = element =>
    element.type === 'video' ? true : isVoid(element);
  return editor;
};

const Element = (props: RenderElementProps) => {
  const { attributes, children, element } = props;
  switch (element.type) {
    case 'video':
      return <VideoElement {...props} />;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const VideoElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const editor = useEditor();
  const selected = useSelected();
  const focused = useFocused();
  const { url } = element;
  return (
    <div {...attributes}>
      <div
        contentEditable={false}
        style={{
          position: 'relative',
          boxShadow: selected && focused ? '0 0 0 3px #B4D5FF' : 'none',
        }}
      >
        <div
          style={{
            display: selected && focused ? 'none' : 'block',
            position: 'absolute',
            top: '0',
            left: '0',
            height: '100%',
            width: '100%',
            cursor: 'cell',
            zIndex: 1,
          }}
        />
        <div
          style={{
            padding: '75% 0 0 0',
            position: 'relative',
          }}
        >
          <iframe
            title="embed"
            src={`${url}?title=0&byline=0&portrait=0`}
            frameBorder="0"
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
            }}
          />
        </div>
        {selected && focused ? (
          <input
            value={url}
            onClick={e => e.stopPropagation()}
            style={{
              marginTop: '5px',
              boxSizing: 'border-box',
            }}
            onChange={value => {
              const path = editor.findPath(element);
              Editor.setNodes(editor, { url: value }, { at: path });
            }}
          />
        ) : null}
      </div>
      {children}
    </div>
  );
};

export const Embeds = () => {
  const [value, setValue] = useState(initialValue);
  const [selection, setSelection] = useState<Range | null>(null);
  const editor = useMemo(() => withEmbeds(withReact(createEditor())), []);
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
        renderElement={props => <Element {...props} />}
        placeholder="Enter some text..."
      />
    </Slate>
  );
};
