import React from 'react';
import { DefaultLeaf } from '../components/DefaultLeaf';
import { PlateEditor } from '../types/PlateEditor';
import { PlateRenderLeafProps } from '../types/PlateRenderLeafProps';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { PlatePluginComponent } from '../types/plugins/PlatePlugin/PlatePluginComponent';
import { RenderLeaf } from '../types/plugins/PlatePlugin/RenderLeaf';
import { getRenderNodeProps } from './getRenderNodeProps';

/**
 * Get a `Editable.renderLeaf` handler for `options.type`.
 * If the type is equals to the slate leaf type and if the text is not empty, render `options.component`.
 * Else, return `children`.
 */
export const getRenderLeaf = (
  editor: PlateEditor,
  {
    key,
    type = key,
    component: Leaf = DefaultLeaf as PlatePluginComponent,
    getNodeProps,
    overrideProps,
  }: PlatePlugin
): RenderLeaf => (props: PlateRenderLeafProps) => {
  const { leaf, children } = props;

  if (leaf[type] && !!leaf.text) {
    const nodeProps = getRenderNodeProps({
      attributes: leaf.attributes,
      getNodeProps,
      overrideProps,
      props,
      type,
    });

    return <Leaf {...nodeProps}>{children}</Leaf>;
  }

  return children;
};
