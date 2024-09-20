import React from 'react';

import type { Value } from '@udecode/slate';

import type { PlateEditor } from '../../shared/types/PlateEditor';
import type { RenderLeaf } from '../../shared/types/RenderLeaf';
import type { PlatePlugin } from '../../shared/types/plugin/PlatePlugin';

import { DefaultLeaf } from '../../shared/components/DefaultLeaf';
import { getRenderNodeProps } from '../../shared/utils/getRenderNodeProps';

/**
 * Get a `Editable.renderLeaf` handler for `options.type`. If the type is equals
 * to the slate leaf type, render `options.component`. Else, return `children`.
 */
export const pluginRenderLeaf = <V extends Value>(
  editor: PlateEditor<V>,
  {
    component,
    dangerouslyAllowAttributes,
    key,
    props,
    type = key,
  }: PlatePlugin<{}, V>
): RenderLeaf =>
  function render(nodeProps) {
    const { children, leaf } = nodeProps;

    if (leaf[type]) {
      const Leaf = component ?? DefaultLeaf;

      nodeProps = getRenderNodeProps({
        attributes: leaf.attributes as any,
        dangerouslyAllowAttributes,
        nodeProps: nodeProps as any,
        props,
        type,
      }) as any;

      return <Leaf {...nodeProps}>{children}</Leaf>;
    }

    return children;
  };
