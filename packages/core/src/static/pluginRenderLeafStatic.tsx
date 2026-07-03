import React from 'react';

import clsx from 'clsx';

import type { RenderLeafProps, AnyBasePlugin, BaseEditor } from '../lib';

import { PliteLeaf } from './components';
import { getNodeDataAttributes } from './utils/getNodeDataAttributes';
import { getRenderNodeStaticProps } from './utils/getRenderNodeStaticProps';

export type PliteRenderLeaf = (
  props: RenderLeafProps
) => React.ReactNode | undefined;

export const pluginRenderLeafStatic = (
  editor: BaseEditor,
  plugin: AnyBasePlugin
): PliteRenderLeaf =>
  function render(props) {
    const { children, leaf } = props;

    if (leaf[plugin.node.type]) {
      const Component = (plugin.render.leaf ??
        editor.runtime.components?.[plugin.key]) as any;
      const Leaf = Component ?? PliteLeaf;

      const ctxProps = getRenderNodeStaticProps({
        attributes: { ...(leaf.attributes as any) },
        editor,
        node: leaf,
        path: props.path,
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
  editor: BaseEditor,
  { renderLeaf: renderLeafProp }: { renderLeaf?: PliteRenderLeaf } = {}
): PliteRenderLeaf => {
  const renderLeafs: PliteRenderLeaf[] = [];
  const leafPropsPlugins: AnyBasePlugin[] = [];

  editor.runtime.pluginCache.node.isLeaf.forEach((key) => {
    const plugin = editor.getPlugin({ key });

    if (plugin) {
      renderLeafs.push(pluginRenderLeafStatic(editor, plugin as any));
    }
  });

  editor.runtime.pluginCache.node.leafProps.forEach((key) => {
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
      path: props.path,
      props: { attributes, ...props } as any,
    }) as any;

    const leaf = ctxProps.leaf;
    const dataAttributes = getNodeDataAttributes(editor, leaf, {
      isLeaf: true,
    });

    return (
      <PliteLeaf
        {...ctxProps}
        attributes={{
          ...ctxProps.attributes,
          ...dataAttributes,
        }}
      />
    );
  };
};
