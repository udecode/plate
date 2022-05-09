import React from 'react';
import { DefaultLeaf } from '../components/DefaultLeaf';
import { Value } from '../slate/editor/TEditor';
import { TEditableProps } from '../slate/types/TEditableProps';
import { PlateEditor } from '../types/PlateEditor';
import { PlateRenderLeafProps } from '../types/PlateRenderLeafProps';
import { RenderLeaf } from '../types/RenderLeaf';
import { pipeInjectProps } from './pipeInjectProps';
import { pluginRenderLeaf } from './pluginRenderLeaf';

/**
 * @see {@link RenderLeaf}
 */
export const pipeRenderLeaf = <V extends Value>(
  editor: PlateEditor<V>,
  renderLeafProp?: TEditableProps<V>['renderLeaf']
): TEditableProps<V>['renderLeaf'] => {
  const renderLeafs: RenderLeaf[] = [];

  editor.plugins.forEach((plugin) => {
    if (plugin.isLeaf && plugin.key) {
      renderLeafs.push(pluginRenderLeaf(editor, plugin));
    }
  });

  return (nodeProps) => {
    const props = pipeInjectProps(editor, nodeProps) as PlateRenderLeafProps<V>;

    renderLeafs.forEach((renderLeaf) => {
      const newChildren = renderLeaf(props as any);
      if (newChildren !== undefined) {
        props.children = newChildren;
      }
    });

    if (renderLeafProp) {
      return renderLeafProp(props);
    }

    return <DefaultLeaf {...props} />;
  };
};
