import React from 'react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { DefaultLeaf } from '../components/DefaultLeaf';
import { PlatePlugin } from '../types/PlatePlugin/PlatePlugin';
import { SPEditor } from '../types/SPEditor';
import { pipeOverrideProps } from './pipeOverrideProps';

/**
 * @see {@link RenderLeaf}
 */
export const pipeRenderLeaf = (
  editor: SPEditor,
  plugins: PlatePlugin[] = []
): EditableProps['renderLeaf'] => {
  const renderLeafs = plugins.flatMap(
    (plugin) => plugin.renderLeaf?.(editor) ?? []
  );

  const propsOverriders = plugins.flatMap(
    (plugin) => plugin.overrideProps?.(editor) ?? []
  );

  return (renderLeafProps) => {
    const props = pipeOverrideProps(renderLeafProps, propsOverriders);

    renderLeafs.forEach((renderLeaf) => {
      const newChildren = renderLeaf(props);
      if (newChildren !== undefined) {
        props.children = newChildren;
      }
    });

    return <DefaultLeaf {...props} />;
  };
};
