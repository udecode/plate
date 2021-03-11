import * as React from 'react';
import { RenderElementProps } from 'slate-react';

export const CodeBlockContainerElement = ({
  attributes,
  children,
}: RenderElementProps) => {
  return (
    <div {...attributes} contentEditable={false}>
      {children}
    </div>
  );
};
