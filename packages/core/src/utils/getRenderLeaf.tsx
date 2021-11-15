import React from 'react';
import { DefaultLeaf } from '../components/DefaultLeaf';
import { PlateEditor } from '../types/PlateEditor';
import { PlateRenderLeafProps } from '../types/PlateRenderLeafProps';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { RenderLeaf } from '../types/RenderLeaf';
import { getRenderNodeProps } from './getRenderNodeProps';

/**
 * Get a `Editable.renderLeaf` handler for `options.type`.
 * If the type is equals to the slate leaf type and if the text is not empty, render `options.component`.
 * Else, return `children`.
 */
export const getRenderLeaf = (
  editor: PlateEditor,
  { key, type = key, component, props }: PlatePlugin
): RenderLeaf => (nodeProps: PlateRenderLeafProps) => {
  const { leaf, children } = nodeProps;

  const Leaf = component ?? DefaultLeaf;

  if (leaf[type] && !!leaf.text) {
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
