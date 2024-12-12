import React from 'react';

import type { SlateEditor } from '../editor';
import type { SlatePlugin } from '../plugin';
import type { RenderStaticLeaf } from './type';

import { PlateStaticLeaf } from './components/DefaultStaticLeaf';
import { getRenderStaticNodeProps } from './pipeRenderStaticElement';

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
      const Leaf = staticComponent ?? PlateStaticLeaf;

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

  return function render(nodeProps) {
    renderLeafs.forEach((renderLeaf) => {
      const newChildren = renderLeaf(nodeProps as any);

      if (newChildren !== undefined) {
        nodeProps.children = newChildren;
      }
    });

    if (renderLeafProp) {
      return renderLeafProp(nodeProps);
    }

    const ctxProps = getRenderStaticNodeProps({
      editor,
      props: nodeProps as any,
    }) as any;

    return <PlateStaticLeaf {...ctxProps} />;
  };
};
