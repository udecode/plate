import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { createEditor, Editor, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import {
  ReactEditor,
  RenderElementProps,
  useEditor,
  withReact,
} from 'slate-react';
import { pipe, withInlineVoid } from '../../../common';
import { CodeBlockPlugin } from '../CodeBlockPlugin';
import { EditorChild } from './EditorChild';

export const CodeBlockContainerElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const editor = useEditor();

  // FIXME handle non-default options once working

  const codeBlockContainerPath = ReactEditor.findPath(editor, element);

  // FIXME: This is incorrect

  const onChange = useCallback(
    (e, _editor) => {
      Transforms.setNodes(_editor, { value }, { at: codeBlockContainerPath });
    },
    // FIXME: This is incorrect
    [codeBlockContainerPath]
  );

  // FIXME: Is this correct (onChange), if so what should the type be for event
  return (
    <div {...attributes} contentEditable={false}>
      <EditorChild
        onChange={(event) => onChange(editor, event.target.value)}
        initialValue={element.value}
      />
    </div>
  );
};
