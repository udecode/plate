import React from 'react';

import clsx from 'clsx';

import type { RenderLeafProps, SlateEditor, SlatePlugin } from '../lib';

import { SlateLeaf } from './components';
import { getNodeDataAttributes } from './utils/getNodeDataAttributes';
import { getRenderNodeStaticProps } from './utils/getRenderNodeStaticProps';

export type SlateRenderLeaf = (
  props: RenderLeafProps
) => React.ReactElement<any> | undefined;

export const pluginRenderLeafStatic = (
  editor: SlateEditor,
  plugin: SlatePlugin
): SlateRenderLeaf =>
  function render(props) {
    const { children, leaf } = props;

    if (leaf[plugin.node.type]) {
      const Component = (plugin.render.leaf ??
        editor.meta.components?.[plugin.key]) as any;
      const Leaf = Component ?? SlateLeaf;

      const ctxProps = getRenderNodeStaticProps({
        attributes: { ...(leaf.attributes as any) },
        editor,
        node: leaf,
        plugin,
        props: props as any,
      }) as any;

      const defaultProps = Component ? {} : { as: plugin.render?.as };

      return (
        <Leaf {...defaultProps} {...ctxProps}>
          {children}
        </Leaf>
      );
    }

    return children;
  };

/** @see {@link RenderLeaf} */
export const pipeRenderLeafStatic = (
  editor: SlateEditor,
  { renderLeaf: renderLeafProp }: { renderLeaf?: SlateRenderLeaf } = {}
): SlateRenderLeaf => {
  const renderLeafs: SlateRenderLeaf[] = [];
  const leafPropsPlugins: SlatePlugin[] = [];

  editor.meta.pluginCache.node.isLeaf.forEach((key) => {
    const plugin = editor.getPlugin({ key });

    if (plugin) {
      renderLeafs.push(pluginRenderLeafStatic(editor, plugin as any));
    }
  });

  editor.meta.pluginCache.node.leafProps.forEach((key) => {
    const plugin = editor.getPlugin({ key });
    if (plugin) {
      leafPropsPlugins.push(plugin as any);
    }
  });

  return function render({ attributes, ...props }) {
    renderLeafs.forEach((render) => {
      const newChildren = render(props as any);

      if (newChildren !== undefined) {
        props.children = newChildren;
      }
    });

    leafPropsPlugins.forEach((plugin) => {
      if (props.leaf[plugin.node.type]) {
        const pluginLeafProps =
          typeof plugin.node.leafProps === 'function'
            ? plugin.node.leafProps(props as any)
            : (plugin.node.leafProps ?? {});

        if (pluginLeafProps.className) {
          pluginLeafProps.className = clsx(
            (props as any).className,
            pluginLeafProps.className
          );
        }

        attributes = {
          ...attributes,
          ...pluginLeafProps,
        };
      }
    });

    if (renderLeafProp) {
      return renderLeafProp({ attributes, ...props });
    }

    const ctxProps = getRenderNodeStaticProps({
      editor,
      props: { attributes, ...props } as any,
    }) as any;

    const leaf = ctxProps.leaf;
    const dataAttributes = getNodeDataAttributes(editor, leaf, {
      isLeaf: true,
    });

    return (
      <SlateLeaf
        {...ctxProps}
        attributes={{
          ...ctxProps.attributes,
          ...dataAttributes,
        }}
      />
    );
  };
};
