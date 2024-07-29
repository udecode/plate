import React from 'react';

import type { PlateEditor } from '../../shared/types/PlateEditor';
import type { PlateRenderLeafProps } from '../../shared/types/PlateRenderLeafProps';
import type { RenderLeaf } from '../../shared/types/RenderLeaf';
import type { TEditableProps } from '../../shared/types/slate-react/TEditableProps';

import { DefaultLeaf } from '../../shared';
import { pipeInjectProps } from '../../shared/utils/pipeInjectProps';
import { pluginRenderLeaf } from './pluginRenderLeaf';

/** @see {@link RenderLeaf} */
export const pipeRenderLeaf = (
  editor: PlateEditor,
  renderLeafProp?: TEditableProps['renderLeaf']
): TEditableProps['renderLeaf'] => {
  const renderLeafs: RenderLeaf[] = [];

  editor.plugins.forEach((plugin) => {
    if (plugin.isLeaf && plugin.key) {
      renderLeafs.push(pluginRenderLeaf(editor, plugin));
    }
  });

  return function render(nodeProps) {
    const props = pipeInjectProps(editor, nodeProps) as PlateRenderLeafProps;

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
