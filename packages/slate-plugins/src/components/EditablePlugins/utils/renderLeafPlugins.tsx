import * as React from 'react';
import { RenderLeafProps } from 'slate-react';
import { RenderLeaf, SlatePlugin } from '../../../common';

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
