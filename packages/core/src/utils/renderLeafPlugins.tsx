import * as React from 'react';
import { RenderLeafProps } from 'slate-react';
import { RenderLeaf, SlatePlugin } from '../types';

export const renderLeafPlugins = (
  plugins: SlatePlugin[],
  renderLeafList: RenderLeaf[]
) => {
  const Tag = (props: RenderLeafProps) => {
    const leafProps: RenderLeafProps = { ...props }; // workaround for children readonly error.
    renderLeafList.forEach((renderLeaf) => {
      leafProps.children = renderLeaf(leafProps);
    });

    plugins.forEach(({ renderLeaf }) => {
      if (!renderLeaf) return;
      leafProps.children = renderLeaf(leafProps);
    });

    return <span {...leafProps.attributes}>{leafProps.children}</span>;
  };

  return (leafProps: RenderLeafProps) => {
    // XXX: A wrapper tag component to make useContext get correct value inside.
    return <Tag {...leafProps} />;
  };
};
