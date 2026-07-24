import React from 'react';

import clsx from 'clsx';

import type { RenderTextProps, AnyBasePlugin, BaseEditor } from '..';
import { getPlateRuntime } from '../internal/plugin/compilePlateModel';

import { PliteText } from './components';
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

    if (text[plugin.type]) {
      const Component = getPlateRuntime(editor).components[plugin.key] as any;
      const Text = Component ?? PliteText;

      const ctxProps = getRenderNodeStaticProps({
        editor,
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

  getPlateRuntime(editor).pluginCache.node.textMarks.forEach((key) => {
    const plugin = editor.getPlugin({ key });

    if (plugin) {
      renderTexts.push(pluginRenderTextStatic(editor, plugin as any));
    }
  });

  getPlateRuntime(editor).pluginCache.node.textProps.forEach((key) => {
    const plugin = editor.getPlugin({ key });
    if (plugin) {
      textPropsPlugins.push(plugin as any);
    }
  });

  return function render({ attributes, ...props }) {
    let children = props.children;

    renderTexts.forEach((renderText) => {
      const newChildren = renderText({ ...props, children } as any);

      if (newChildren !== undefined) {
        children = newChildren;
      }
    });

    textPropsPlugins.forEach((plugin) => {
      if (props.text[plugin.type]) {
        const pluginTextProps =
          typeof plugin.render.textProps === 'function'
            ? plugin.render.textProps({ ...props, children } as any)
            : (plugin.render.textProps ?? {});

        attributes = {
          ...attributes,
          ...pluginTextProps,
          ...(pluginTextProps.className && {
            className: clsx(
              (props as any).className,
              pluginTextProps.className
            ),
          }),
        };
      }
    });

    if (renderTextProp) {
      return renderTextProp({ attributes, ...props, children });
    }

    const ctxProps = getRenderNodeStaticProps({
      editor,
      path: props.path,
      props: { attributes, ...props, children } as any,
    }) as any;

    return <PliteText {...ctxProps} />;
  };
};
