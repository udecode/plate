import React from 'react';

import type { SlateEditor } from '../editor';
import type { NodeComponents, SlatePlugin } from '../plugin';
import type { RenderLeafProps } from '../types/RenderLeafProps';

import { SlateLeaf } from './components/SlateLeaf';
import {
  getLeafDataAttributes,
  getPluginDataAttributes,
} from './utils/getNodeDataAttributes';
import { getRenderNodeStaticProps } from './utils/getRenderNodeStaticProps';

export type SlateRenderLeaf = (
  props: RenderLeafProps
) => React.ReactElement<any> | undefined;

export const pluginRenderLeafStatic = (
  editor: SlateEditor,
  plugin: SlatePlugin,
  components: NodeComponents
): SlateRenderLeaf =>
  function render(nodeProps) {
    const { children, leaf } = nodeProps;

    if (leaf[plugin.node.type ?? plugin.key]) {
      const Leaf = components?.[plugin.key] ?? SlateLeaf;

      const dataAttributes = getPluginDataAttributes(editor, plugin, leaf);

      const ctxProps = getRenderNodeStaticProps({
        attributes: {
          ...(leaf.attributes as any),
          ...dataAttributes,
        },
        editor,
        node: leaf,
        plugin,
        props: nodeProps as any,
      }) as any;

      return <Leaf {...ctxProps}>{children}</Leaf>;
    }

    return children;
  };

/** @see {@link RenderLeaf} */
export const pipeRenderLeafStatic = (
  editor: SlateEditor,
  {
    components,
    renderLeaf: renderLeafProp,
  }: {
    components: NodeComponents;
    renderLeaf?: SlateRenderLeaf;
  }
): SlateRenderLeaf => {
  const renderLeafs: SlateRenderLeaf[] = [];

  editor.pluginList.forEach((plugin) => {
    if (plugin.node.isLeaf && plugin.key) {
      renderLeafs.push(pluginRenderLeafStatic(editor, plugin, components));
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

    const ctxProps = getRenderNodeStaticProps({
      attributes: props.attributes as any,
      editor,
      props: props as any,
    }) as any;

    const leaf = ctxProps.leaf;

    const dataAttributes = getLeafDataAttributes(leaf);

    return <SlateLeaf {...ctxProps} {...dataAttributes} />;
  };
};
