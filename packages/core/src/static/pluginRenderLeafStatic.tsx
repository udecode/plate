import clsx from 'clsx';
import React from 'react';

import {
  getCompiledPlateModelBinding,
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../internal/plugin/compilePlateModel';
import type {
  AnyBasePlugin,
  AnyBasePluginPortal,
  AnyPluginBase,
  BaseEditor,
  StaticRenderLeafProps as RenderLeafProps,
} from '../lib';
import { PliteLeaf } from './components';
import { getRenderNodeStaticProps } from './utils/getRenderNodeStaticProps';

export type PliteRenderLeaf = (
  props: RenderLeafProps
) => React.ReactNode | undefined;

export const pluginRenderLeafStatic = (
  editor: BaseEditor,
  plugin: AnyBasePluginPortal | AnyPluginBase
): PliteRenderLeaf =>
  function render(props) {
    const { children, leaf } = props;
    const leafKey = getCompiledPlateModelBinding(editor, plugin)?.propertyKey;

    if (leafKey && leaf[leafKey]) {
      const Component = (plugin.render.leaf ??
        getPlateRuntime(editor).components[leafKey]) as any;
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
  const leafPropsEntries: Array<{ key: string; plugin: AnyBasePlugin }> = [];

  getPlateRuntime(editor).pluginCache.node.decoratedMarks.forEach((name) => {
    const plugin = getCompiledPlatePlugin(editor, name)!;

    if (plugin) {
      renderLeafs.push(pluginRenderLeafStatic(editor, plugin as any));
    }
  });

  getPlateRuntime(editor).pluginCache.node.leafProps.forEach((name) => {
    const plugin = getCompiledPlatePlugin(editor, name)!;
    const key = plugin
      ? getCompiledPlateModelBinding(editor, plugin)?.propertyKey
      : undefined;

    if (plugin && key) {
      leafPropsEntries.push({ key, plugin });
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

    leafPropsEntries.forEach(({ key, plugin }) => {
      if (props.leaf[key]) {
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
