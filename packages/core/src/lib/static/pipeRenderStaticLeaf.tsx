import React from 'react';

import type { SlateEditor } from '../editor';
import type { SlatePlugin } from '../plugin';
import type { StaticComponents } from './components';
import type { RenderStaticLeaf } from './type';

import { PlateStaticLeaf } from './components/PlateStaticLeaf';
import { getRenderStaticNodeProps } from './utils/getRenderStaticNodeProps';

export const pluginRenderStaticLeaf = (
  editor: SlateEditor,
  plugin: SlatePlugin,
  staticComponents: StaticComponents
): RenderStaticLeaf =>
  function render(nodeProps) {
    const { children, leaf } = nodeProps;

    if (leaf[plugin.node.type ?? plugin.key]) {
      const Leaf = staticComponents?.[plugin.key] ?? PlateStaticLeaf;

      const ctxProps = getRenderStaticNodeProps({
        attributes: leaf.attributes as any,
        editor,
        plugin,
        props: nodeProps as any,
      }) as any;

      return <Leaf {...ctxProps}>{children}</Leaf>;
    }

    return children;
  };

/** @see {@link RenderLeaf} */
export const pipeRenderStaticLeaf = (
  editor: SlateEditor,
  staticComponents: StaticComponents,
  renderLeafProp?: RenderStaticLeaf
): RenderStaticLeaf => {
  const renderLeafs: RenderStaticLeaf[] = [];

  editor.pluginList.forEach((plugin) => {
    if (plugin.node.isLeaf && plugin.key) {
      renderLeafs.push(
        pluginRenderStaticLeaf(editor, plugin, staticComponents)
      );
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
