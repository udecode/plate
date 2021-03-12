import * as React from 'react';
import { useCallback } from 'react';
import { Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useEditor } from 'slate-react';
import { EditorChild } from './EditorChild';

export const CodeBlockContainerElement = ({
  attributes,
  element,
}: RenderElementProps) => {
  const editor = useEditor();

  // FIXME handle non-default options once working

  const onChange = useCallback(
    (value) => {
      Transforms.setNodes(
        editor,
        { children: value },
        { at: ReactEditor.findPath(editor, element) }
      );
    },
    [editor, element]
  );

  return (
    <div {...attributes} contentEditable={false}>
      <EditorChild onChange={onChange} initialValue={element.children} />
    </div>
  );
};
