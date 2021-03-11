import * as React from 'react';
import { RenderElementProps } from 'slate-react';

//

export const EditorChild = ({ attributes, children }: RenderElementProps) => {
  return (
    <div {...attributes} contentEditable>
      {children}
    </div>
  );
};
