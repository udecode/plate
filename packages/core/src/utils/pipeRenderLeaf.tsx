import React from 'react';
import { Value } from '@udecode/slate';
import { DefaultLeaf } from '../components/DefaultLeaf';
import { PlateEditor } from '../types/PlateEditor';
import { PlateRenderLeafProps } from '../types/PlateRenderLeafProps';
import { RenderLeaf } from '../types/RenderLeaf';
import { TEditableProps } from '../types/slate-react/TEditableProps';
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

  return function render(nodeProps) {
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
