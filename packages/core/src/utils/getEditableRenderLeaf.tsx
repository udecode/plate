import * as React from 'react';
import { DefaultLeaf } from 'slate-react';
import { PlatePluginComponent } from '../types/PlatePluginOptions/PlateOptions';
import { RenderNodeOptions } from '../types/PlatePluginOptions/RenderNodeOptions';
import { TRenderLeafProps } from '../types/TRenderLeafProps';
import { getSlateClass } from './getSlateClass';

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
}: RenderNodeOptions) => ({
  children,
  leaf,
  text,
  attributes,
}: TRenderLeafProps) => {
  if (leaf[type] && !!leaf.text) {
    const renderNodeProps = {
      children,
      leaf,
      text,
      attributes,
    };

    const nodeProps = getNodeProps?.(renderNodeProps) ?? leaf.attributes ?? {};

    let props: any = {};

    if (overrideProps) {
      props =
        typeof overrideProps === 'function'
          ? overrideProps(renderNodeProps)
          : overrideProps;
    }

    return (
      <Leaf
        className={getSlateClass(type)}
        attributes={attributes}
        leaf={leaf}
        text={text}
        nodeProps={nodeProps}
        {...props}
      >
        {children}
      </Leaf>
    );
  }

  return children;
};
