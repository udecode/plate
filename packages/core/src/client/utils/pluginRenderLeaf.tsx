import React from 'react';
import { Value } from '@udecode/slate';

import { DefaultLeaf } from '../../components/DefaultLeaf';
import { PlateEditor } from '../../types/PlateEditor';
import { PlatePlugin } from '../../types/plugin/PlatePlugin';
import { RenderLeaf } from '../../types/RenderLeaf';
import { getRenderNodeProps } from '../../utils/getRenderNodeProps';

/**
 * Get a `Editable.renderLeaf` handler for `options.type`.
 * If the type is equals to the slate leaf type, render `options.component`.
 * Else, return `children`.
 */
export const pluginRenderLeaf = <V extends Value>(
  editor: PlateEditor<V>,
  { key, type = key, component, props }: PlatePlugin<{}, V>
): RenderLeaf =>
  function render(nodeProps) {
    const { leaf, children } = nodeProps;

    if (leaf[type]) {
      const Leaf = component ?? DefaultLeaf;

      nodeProps = getRenderNodeProps({
        attributes: leaf.attributes as any,
        props,
        nodeProps: nodeProps as any,
        type,
      }) as any;

      return <Leaf {...nodeProps}>{children}</Leaf>;
    }

    return children;
  };
