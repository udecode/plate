import React from 'react';
import { DefaultLeaf } from '../../components/plate/DefaultLeaf';
import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { RenderLeaf } from '../../types/plate/RenderLeaf';
import { PlatePlugin } from '../../types/plugin/PlatePlugin';
import { getRenderNodeProps } from './getRenderNodeProps';

/**
 * Get a `Editable.renderLeaf` handler for `options.type`.
 * If the type is equals to the slate leaf type, render `options.component`.
 * Else, return `children`.
 */
export const pluginRenderLeaf = <V extends Value>(
  editor: PlateEditor<V>,
  { key, type = key, component, props }: PlatePlugin<{}, V>
): RenderLeaf => (nodeProps) => {
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
