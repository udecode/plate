import React from 'react';

import type { PlateEditor } from '../editor/PlateEditor';
import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';
import type { PlateRenderLeafProps } from '../plugin/PlateRenderLeafProps';

import { DefaultLeaf } from '../components/DefaultLeaf';
import { getRenderNodeProps } from './getRenderNodeProps';

export type RenderLeaf = (props: PlateRenderLeafProps) => React.ReactElement;

/**
 * Get a `Editable.renderLeaf` handler for `options.type`. If the type is equals
 * to the slate leaf type, render `options.component`. Else, return `children`.
 */
export const pluginRenderLeaf = (
  editor: PlateEditor,
  plugin: AnyEditorPlatePlugin
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
