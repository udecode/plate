import * as React from 'react';
import { DefaultLeaf } from 'slate-react';
import { PlatePluginComponent } from '../types/PlatePluginOptions/PlateOptions';
import { RenderNodeOptions } from '../types/PlatePluginOptions/RenderNodeOptions';
import { SPRenderLeafProps } from '../types/SPRenderLeafProps';
import { getRenderNodeProps } from './getRenderNodeProps';

/**
 * Get a `Editable.renderLeaf` handler for `options.type`.
 * If the type is equals to the slate leaf type and if the text is not empty, render `options.component`.
 * Else, return `children`.
 */
export const getEditableRenderLeaf = ({
  type,
  component: Leaf = DefaultLeaf as PlatePluginComponent,
  getNodeProps,
  overrideProps,
}: RenderNodeOptions) => (props: SPRenderLeafProps) => {
  const { leaf, children } = props;

  if (leaf[type] && !!leaf.text) {
    const nodeProps = getRenderNodeProps({
      attributes: leaf.attributes,
      getNodeProps,
      overrideProps,
      props,
      type,
    });

    return (
      <Leaf {...props} {...nodeProps}>
        {children}
      </Leaf>
    );
  }

  return children;
};
