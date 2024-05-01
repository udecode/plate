import React from 'react';
import { Value } from '@udecode/slate';

import { DefaultLeaf } from '../../shared';
import { PlateEditor } from '../../shared/types/PlateEditor';
import { PlateRenderLeafProps } from '../../shared/types/PlateRenderLeafProps';
import { RenderLeaf } from '../../shared/types/RenderLeaf';
import { TEditableProps } from '../../shared/types/slate-react/TEditableProps';
import { pipeInjectProps } from '../../shared/utils/pipeInjectProps';
import { pluginRenderLeaf } from './pluginRenderLeaf';

/**
 * @see {@link RenderLeaf}
 */
export const pipeRenderLeaf = <V extends Value>(
  editor: PlateEditor<V>,
  renderLeafProp?: TEditableProps['renderLeaf']
): TEditableProps['renderLeaf'] => {
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
