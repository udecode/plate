import React from 'react';

import clsx from 'clsx';

import type { RenderTextProps, AnyBasePlugin, BaseEditor } from '..';

import { PliteText } from './components';
import { getNodeDataAttributes } from './utils/getNodeDataAttributes';
import { getRenderNodeStaticProps } from './utils/getRenderNodeStaticProps';

export type PliteRenderText = (
  props: RenderTextProps
) => React.ReactNode | undefined;

export const pluginRenderTextStatic = (
  editor: BaseEditor,
  plugin: AnyBasePlugin
): PliteRenderText =>
  function render(nodeProps) {
    const { children, text } = nodeProps;

    if (text[plugin.node.type ?? plugin.key]) {
      const Component = editor.runtime.components?.[plugin.key] as any;
      const Text = Component ?? PliteText;

      // const dataAttributes = getPluginDataAttributes(editor, plugin, text);

      const ctxProps = getRenderNodeStaticProps({
        attributes: { ...(text.attributes as any) },
        editor,
        node: text,
        path: nodeProps.path,
        plugin,
        props: nodeProps as any,
      }) as any;

      const defaultProps = Component ? {} : { as: plugin.render?.as };

      return (
        <Text {...defaultProps} {...ctxProps}>
          {children}
        </Text>
      );
    }

    return children;
  };

/** @see {@link RenderText} */
export const pipeRenderTextStatic = (
  editor: BaseEditor,
  { renderText: renderTextProp }: { renderText?: PliteRenderText } = {}
): PliteRenderText => {
  const renderTexts: PliteRenderText[] = [];
  const textPropsPlugins: AnyBasePlugin[] = [];

  editor.runtime.pluginCache.node.isText.forEach((key) => {
    const plugin = editor.getPlugin({ key });

    if (plugin) {
      renderTexts.push(pluginRenderTextStatic(editor, plugin as any));
    }
  });

  editor.runtime.pluginCache.node.textProps.forEach((key) => {
    const plugin = editor.getPlugin({ key });
    if (plugin) {
      textPropsPlugins.push(plugin as any);
    }
  });

  return function render({ attributes, ...props }) {
    renderTexts.forEach((render) => {
      const newChildren = render(props as any);

      if (newChildren !== undefined) {
        props.children = newChildren;
      }
    });

    textPropsPlugins.forEach((plugin) => {
      if (props.text[plugin.node.type ?? plugin.key]) {
        const pluginTextProps =
          typeof plugin.node.textProps === 'function'
            ? plugin.node.textProps(props as any)
            : (plugin.node.textProps ?? {});

        if (pluginTextProps.className) {
          pluginTextProps.className = clsx(
            (props as any).className,
            pluginTextProps.className
          );
        }

        attributes = {
          ...attributes,
          ...pluginTextProps,
        };
      }
    });

    if (renderTextProp) {
      return renderTextProp({ attributes, ...props });
    }

    const ctxProps = getRenderNodeStaticProps({
      editor,
      path: props.path,
      props: { attributes, ...props } as any,
    }) as any;

    const text = ctxProps.text;
    const dataAttributes = getNodeDataAttributes(editor, text, {
      isText: true,
    });

    return (
      <PliteText
        {...ctxProps}
        attributes={{
          ...ctxProps.attributes,
          ...dataAttributes,
        }}
      />
    );
  };
};
