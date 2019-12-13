import React from 'react';
import { Editor } from 'slate';
import {
  RenderElementProps,
  useEditor,
  useFocused,
  useSelected,
} from 'slate-react';

export const VideoElement = ({
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
