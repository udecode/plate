import * as React from 'react';
import { DefaultLeaf, RenderLeafProps } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { SPEditor } from '../types/SPEditor';

/**
 * @see {@link RenderLeaf}
 */
export const pipeRenderLeaf = (
  editor: SPEditor,
  plugins: SlatePlugin[]
): EditableProps['renderLeaf'] => {
  const renderLeafs = plugins.flatMap(
    (plugin) => plugin.renderLeaf?.(editor) ?? []
  );

  return (props) => {
    const leafProps: RenderLeafProps = { ...props }; // workaround for children readonly error.

    renderLeafs.forEach((renderLeaf) => {
      const newChildren = renderLeaf(leafProps);
      if (newChildren !== undefined) {
        leafProps.children = newChildren;
      }
    });

    return <DefaultLeaf {...leafProps} />;
  };
};
