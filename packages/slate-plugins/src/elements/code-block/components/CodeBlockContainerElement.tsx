import * as React from 'react';
import { RenderElementProps, withReact } from 'slate-react';
import { EditorChild } from './EditorChild';
import { useCallback, useMemo } from 'react';
import { createEditor, Transforms } from 'slate';
import { CodeBlockPlugin } from '../CodeBlockPlugin';
import { withHistory } from 'slate-history';
import { pipe, withInlineVoid } from '../../../common';

export const CodeBlockContainerElement = ({
  attributes,
  children,
  options
}: RenderElementProps) => {

  // FIXME Do the default options approach here?

  // FIXME: Invoke these inside the renderElement call or outside?

  const plugins = [CodeBlockPlugin(options)];

  const withPlugins = [
    withReact,
    withHistory,
    withInlineVoid({ plugins }),
  ] as const;

  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  // FIXME: Is this the right approach? Best way to get the codeBlockContainer path and value here?
  // FIXME: Where do I pass the child editor

  const onChange = useCallback(editor: Editor, value: any) => {
    Transforms.setNodes(editor, {value}, {at: codeBlockContainerPath})
  }

  return (
    <div {...attributes} contentEditable={false}>
      <EditorChild onChange={(event) => onChange(editor, event.target.value)} initialValue={element.value} />
    </div>
  );
};
