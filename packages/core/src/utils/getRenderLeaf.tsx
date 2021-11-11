import React from 'react';
import { DefaultLeaf } from '../components/DefaultLeaf';
import { PlateEditor } from '../types/PlateEditor';
import { RenderLeaf } from '../types/PlatePlugin/RenderLeaf';
import { PlatePluginComponent } from '../types/PlatePluginOptions/PlateOptions';
import { RenderNodeOptions } from '../types/PlatePluginOptions/RenderNodeOptions';
import { PlateRenderLeafProps } from '../types/PlateRenderLeafProps';
import { getPlatePluginOptions } from './getPlatePluginOptions';
import { getRenderNodeProps } from './getRenderNodeProps';

/**
 * Get a `Editable.renderLeaf` handler for `options.type`.
 * If the type is equals to the slate leaf type and if the text is not empty, render `options.component`.
 * Else, return `children`.
 */
export const getRenderLeaf = (editor: PlateEditor, key: string): RenderLeaf => {
  const {
    type,
    component: Leaf = DefaultLeaf as PlatePluginComponent,
    getNodeProps,
    overrideProps,
  }: RenderNodeOptions = getPlatePluginOptions(editor, key);

  return (props: PlateRenderLeafProps) => {
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
};
