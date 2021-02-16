import * as React from 'react';
import { DefaultLeaf, RenderLeafProps } from 'slate-react';
import { RenderLeaf } from '../types/RenderLeaf';

/**
 * @see {@link RenderLeaf}
 */
export const renderLeafPlugins = (
  renderLeafList: (RenderLeaf | undefined)[]
) => {
  const Tag = (props: RenderLeafProps) => {
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

  return (leafProps: RenderLeafProps) => {
    // A wrapper tag component to make useContext get correct value inside.
    return <Tag {...leafProps} />;
  };
};
