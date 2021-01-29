import * as React from 'react';
import { RenderLeafProps } from 'slate-react';
import { RenderLeaf, SlatePlugin } from '../types';

export const renderLeafPlugins = (
  plugins: SlatePlugin[],
  renderLeafList: RenderLeaf[]
) => {
  const Tag = (leafProps: RenderLeafProps) => {
    let leaf;

    renderLeafList.some((renderLeaf) => {
      leaf = renderLeaf(leafProps);
      return !!leaf;
    });
    if (leaf) return leaf;

    plugins.some(({ renderLeaf }) => {
      leaf = renderLeaf && renderLeaf(leafProps);
      return !!leaf;
    });
    if (leaf) return leaf;

    return <span {...leafProps.attributes}>{leafProps.children}</span>;
  };

  return (elementProps: RenderLeafProps) => {
    // XXX: A wrapper tag component to make useContext get correct value inside.
    return <Tag {...elementProps} />;
  };
};
