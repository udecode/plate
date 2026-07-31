import React from 'react';

import clsx from 'clsx';

import type {
  AnyBasePlugin,
  AnyResolvedBasePlugin,
  BaseEditor,
  RenderLeafProps,
} from '../lib';
import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../internal/plugin/compilePlateModel';

import { PliteLeaf } from './components';
import { getRenderNodeStaticProps } from './utils/getRenderNodeStaticProps';

export type PliteRenderLeaf = (
  props: RenderLeafProps
) => React.ReactNode | undefined;

export const pluginRenderLeafStatic = (
  editor: BaseEditor,
  plugin: AnyResolvedBasePlugin
): PliteRenderLeaf =>
  function render(props) {
    const { children, leaf } = props;

    if (leaf[plugin.type]) {
      const Component = (plugin.render.leaf ??
        getPlateRuntime(editor).components[plugin.name]) as any;
      const Leaf = Component ?? PliteLeaf;

      const ctxProps = getRenderNodeStaticProps({
        editor,
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

  getPlateRuntime(editor).pluginCache.node.decoratedMarks.forEach(
    (pluginName) => {
      const plugin = getCompiledPlatePlugin(editor, pluginName)!;

      if (plugin) {
        renderLeafs.push(pluginRenderLeafStatic(editor, plugin as any));
      }
    }
  );

  getPlateRuntime(editor).pluginCache.node.leafProps.forEach((pluginName) => {
    const plugin = getCompiledPlatePlugin(editor, pluginName)!;
    if (plugin) {
      leafPropsPlugins.push(plugin as any);
    }
  });

  return function render({ attributes, ...props }) {
    let children = props.children;

    renderLeafs.forEach((renderLeaf) => {
      const newChildren = renderLeaf({ ...props, children } as any);

      if (newChildren !== undefined) {
        children = newChildren;
      }
    });

    leafPropsPlugins.forEach((plugin) => {
      if (props.leaf[plugin.type]) {
        const pluginLeafProps =
          typeof plugin.render.leafProps === 'function'
            ? plugin.render.leafProps({ ...props, children } as any)
            : (plugin.render.leafProps ?? {});

        attributes = {
          ...attributes,
          ...pluginLeafProps,
          ...(pluginLeafProps.className && {
            className: clsx(
              (props as any).className,
              pluginLeafProps.className
            ),
          }),
        };
      }
    });

    if (renderLeafProp) {
      return renderLeafProp({ attributes, ...props, children });
    }

    const ctxProps = getRenderNodeStaticProps({
      editor,
      path: props.path,
      props: { attributes, ...props, children } as any,
    }) as any;

    return <PliteLeaf {...ctxProps} />;
  };
};
