import React from 'react';
import { DefaultLeaf } from '../components/DefaultLeaf';
import { PlateEditor } from '../types/PlateEditor';
import { PlateRenderLeafProps } from '../types/PlateRenderLeafProps';
import { PlatePlugin } from '../types/plugins/PlatePlugin';
import { RenderLeaf } from '../types/RenderLeaf';
import { getRenderNodeProps } from './getRenderNodeProps';

/**
 * Get a `Editable.renderLeaf` handler for `options.type`.
 * If the type is equals to the slate leaf type, render `options.component`.
 * Else, return `children`.
 */
export const pluginRenderLeaf = (
  editor: PlateEditor,
  { key, type = key, component, props }: PlatePlugin
): RenderLeaf => (nodeProps: PlateRenderLeafProps) => {
  const { leaf, children } = nodeProps;

  if (leaf[type]) {
    const Leaf = component ?? DefaultLeaf;

    nodeProps = getRenderNodeProps({
      attributes: leaf.attributes,
      props,
      nodeProps,
      type,
    });

    return <Leaf {...nodeProps}>{children}</Leaf>;
  }

  return children;
};
