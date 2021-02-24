import * as React from 'react';
import { DefaultLeaf, RenderLeafProps } from 'slate-react';
import { RenderLeaf } from '../types/RenderLeaf';

/**
 * @see {@link RenderLeaf}
 */
export const renderLeafPlugins = (
  renderLeafList: (RenderLeaf | undefined)[]
) => {
  return (props: RenderLeafProps) => {
    const leafProps: RenderLeafProps = { ...props }; // workaround for children readonly error.

    renderLeafList.forEach((renderLeaf) => {
      if (!renderLeaf) return;

      const newChildren = renderLeaf(leafProps);
      if (newChildren !== undefined) {
        leafProps.children = newChildren;
      }
    });

    return <DefaultLeaf {...leafProps} />;
  };
};
