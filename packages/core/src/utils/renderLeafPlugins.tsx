import * as React from 'react';
import { Editor } from 'slate';
import { DefaultLeaf, RenderLeafProps } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { RenderLeaf } from '../types/SlatePlugin/RenderLeaf';

/**
 * @see {@link RenderLeaf}
 */
export const renderLeafPlugins = (
  editor: Editor,
  renderLeafList: (RenderLeaf | undefined)[]
): EditableProps['renderLeaf'] => (props: RenderLeafProps) => {
  const leafProps: RenderLeafProps = { ...props }; // workaround for children readonly error.

  renderLeafList.forEach((renderLeaf) => {
    if (!renderLeaf) return;

    const newChildren = renderLeaf(editor)(leafProps);
    if (newChildren !== undefined) {
      leafProps.children = newChildren;
    }
  });

  return <DefaultLeaf {...leafProps} />;
};
