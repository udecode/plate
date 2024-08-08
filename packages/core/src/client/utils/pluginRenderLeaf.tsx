import React from 'react';

import type { PlateEditor } from '../../shared/types/PlateEditor';
import type { RenderLeaf } from '../../shared/types/RenderLeaf';
import type { AnyEditorPlugin } from '../../shared/types/plugin/PlatePlugin';

import { DefaultLeaf } from '../../shared/components/DefaultLeaf';
import { getRenderNodeProps } from '../../shared/utils/getRenderNodeProps';

/**
 * Get a `Editable.renderLeaf` handler for `options.type`. If the type is equals
 * to the slate leaf type, render `options.component`. Else, return `children`.
 */
export const pluginRenderLeaf = (
  editor: PlateEditor,
  plugin: AnyEditorPlugin
): RenderLeaf =>
  function render(nodeProps) {
    const { component } = plugin;
    const { children, leaf } = nodeProps;

    if (leaf[plugin.type ?? plugin.key]) {
      const Leaf = component ?? DefaultLeaf;

      nodeProps = getRenderNodeProps({
        attributes: leaf.attributes as any,
        nodeProps: nodeProps as any,
        plugin,
      }) as any;

      return <Leaf {...nodeProps}>{children}</Leaf>;
    }

    return children;
  };
