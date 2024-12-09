import React from 'react';

import type { SlateEditor } from '../editor';
import type { SlatePlugin } from '../plugin';
import type { RenderStaticLeaf } from './type';

import { DefaultStaticLeaf } from './components/DefaultStaticLeaf';

export const pluginRenderStaticLeaf = (
  _: SlateEditor,
  plugin: SlatePlugin
): RenderStaticLeaf =>
  function render(nodeProps) {
    const {
      node: { staticComponent },
    } = plugin;
    const { children, leaf } = nodeProps;

    if (leaf[plugin.node.type ?? plugin.key]) {
      const Leaf = staticComponent ?? DefaultStaticLeaf;

      return (
        <Leaf attributes={nodeProps.attributes} leaf={leaf} text={leaf}>
          {children}
        </Leaf>
      );
    }

    return children;
  };

/** @see {@link RenderLeaf} */
export const pipeRenderStaticLeaf = (
  editor: SlateEditor,
  renderLeafProp?: RenderStaticLeaf
): RenderStaticLeaf => {
  const renderLeafs: RenderStaticLeaf[] = [];

  editor.pluginList.forEach((plugin) => {
    if (plugin.node.isLeaf && plugin.key) {
      renderLeafs.push(pluginRenderStaticLeaf(editor, plugin));
    }
  });

  return function render(props) {
    renderLeafs.forEach((renderLeaf) => {
      const newChildren = renderLeaf(props as any);

      if (newChildren !== undefined) {
        props.children = newChildren;
      }
    });

    if (renderLeafProp) {
      return renderLeafProp(props);
    }

    return <DefaultStaticLeaf {...props} />;
  };
};
