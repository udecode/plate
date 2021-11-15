import React from 'react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { DefaultLeaf } from '../components/DefaultLeaf';
import { PlateEditor } from '../types/PlateEditor';
import { PlateRenderLeafProps } from '../types/PlateRenderLeafProps';
import { RenderLeaf } from '../types/RenderLeaf';
import { getRenderLeaf } from './getRenderLeaf';
import { pipeInjectProps } from './pipeInjectProps';

/**
 * @see {@link RenderLeaf}
 */
export const pipeRenderLeaf = (
  editor: PlateEditor,
  editableProps?: EditableProps
): EditableProps['renderLeaf'] => {
  const renderLeafs: RenderLeaf[] = [];

  editor.plugins.forEach((plugin) => {
    if (plugin.isLeaf && plugin.key) {
      renderLeafs.push(getRenderLeaf(editor, plugin));
    }
  });

  return (nodeProps) => {
    const props = pipeInjectProps<PlateRenderLeafProps>(editor, nodeProps);

    renderLeafs.forEach((renderLeaf) => {
      const newChildren = renderLeaf(props as any);
      if (newChildren !== undefined) {
        props.children = newChildren;
      }
    });

    if (editableProps?.renderLeaf) {
      return editableProps.renderLeaf(props);
    }

    return <DefaultLeaf {...props} />;
  };
};
