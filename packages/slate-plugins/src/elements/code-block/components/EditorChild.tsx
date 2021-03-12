import * as React from 'react';
import { RenderElementProps } from 'slate-react';
import { EditorChildProps } from '../types';

export const EditorChild = ({
  attributes,
  children,
}: RenderElementProps & EditorChildProps) => {
  return (
    <div {...attributes} contentEditable>
      {children}
    </div>
  );
};
