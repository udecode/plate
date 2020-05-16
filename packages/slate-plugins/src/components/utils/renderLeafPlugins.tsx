import React from 'react';
import { RenderLeaf, SlatePlugin } from 'common/types';
import { RenderLeafProps } from 'slate-react';

export const renderLeafPlugins = (
  plugins: SlatePlugin[],
  renderLeafList: RenderLeaf[]
) => (leafProps: RenderLeafProps) => {
  renderLeafList.forEach((renderLeaf) => {
    leafProps.children = renderLeaf(leafProps);
  });

  plugins.forEach(({ renderLeaf }) => {
    if (!renderLeaf) return;
    leafProps.children = renderLeaf(leafProps);
  });

  return <span {...leafProps.attributes}>{leafProps.children}</span>;
};
