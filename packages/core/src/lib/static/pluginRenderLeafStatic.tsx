import React from 'react';

import clsx from 'clsx';

import type { SlateEditor } from '../editor';
import type { NodeComponents, SlatePlugin } from '../plugin';
import type { RenderLeafProps } from '../types/RenderLeafProps';

import { SlateLeaf } from './components';
import { getNodeDataAttributes } from './utils/getNodeDataAttributes';
import { getRenderNodeStaticProps } from './utils/getRenderNodeStaticProps';

export type SlateRenderLeaf = (
  props: RenderLeafProps
) => React.ReactElement<any> | undefined;

export const pluginRenderLeafStatic = (
  editor: SlateEditor,
  plugin: SlatePlugin,
  components: NodeComponents
): SlateRenderLeaf =>
  function render(props) {
    const { children, leaf } = props;

    if (leaf[plugin.node.type ?? plugin.key]) {
      const Component = (plugin.render.leaf ?? components?.[plugin.key]) as any;
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
  {
    components,
    renderLeaf: renderLeafProp,
  }: { components: NodeComponents; renderLeaf?: SlateRenderLeaf }
): SlateRenderLeaf => {
  const renderLeafs: SlateRenderLeaf[] = [];
  const leafPropsPlugins: SlatePlugin[] = [];

  editor.pluginList.forEach((plugin) => {
    if (
      plugin.node.isLeaf &&
      (plugin.node.isDecoration === true || plugin.render.leaf)
    ) {
      renderLeafs.push(pluginRenderLeafStatic(editor, plugin, components));
    }

    if (plugin.node.leafProps) {
      leafPropsPlugins.push(plugin);
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
      if (props.leaf[plugin.node.type ?? plugin.key]) {
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
