import React from 'react';

import type { PlateEditor } from '../editor/PlateEditor';
import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';
import type { PlateRenderLeafProps } from '../plugin/PlateRenderLeafProps';

import { DefaultLeaf } from '../components/DefaultLeaf';
import { getRenderNodeProps } from './getRenderNodeProps';

export type RenderLeaf = (props: PlateRenderLeafProps) => React.ReactElement;

/**
 * Get a `Editable.renderLeaf` handler for `plugin.node.type`. If the type is
 * equals to the slate leaf type, render `plugin.render.node`. Else, return
 * `children`.
 */
export const pluginRenderLeaf = (
  editor: PlateEditor,
  plugin: AnyEditorPlatePlugin
): RenderLeaf =>
  function render(nodeProps) {
    const {
      render: { node },
    } = plugin;
    const { children, leaf } = nodeProps;

    if (leaf[plugin.node.type ?? plugin.key]) {
      const Leaf = node ?? DefaultLeaf;

      const ctxProps = getRenderNodeProps({
        attributes: leaf.attributes as any,
        editor,
        plugin,
        props: nodeProps as any,
      }) as any;

      return <Leaf {...ctxProps}>{children}</Leaf>;
    }

    return children;
  };
