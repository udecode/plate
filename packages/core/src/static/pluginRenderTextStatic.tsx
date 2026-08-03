import React from 'react';

import clsx from 'clsx';

import type { BaseEditor } from '../lib/editor/BaseEditor';
import type {
  AnyBasePlugin,
  AnyBasePluginPortal,
  AnyPluginBase,
} from '../lib/plugin/BasePlugin';
import type { RenderTextProps } from '../lib/types/RenderTextProps';
import {
  getCompiledPlateModelBinding,
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../internal/plugin/compilePlateModel';

import { PliteText } from './components';
import { getRenderNodeStaticProps } from './utils/getRenderNodeStaticProps';

export type PliteRenderText = (
  props: RenderTextProps
) => React.ReactNode | undefined;

export const pluginRenderTextStatic = (
  editor: BaseEditor,
  plugin: AnyBasePluginPortal | AnyPluginBase
): PliteRenderText =>
  function render(nodeProps) {
    const { children, text } = nodeProps;
    const textKey = getCompiledPlateModelBinding(editor, plugin)?.propertyKey;

    if (textKey && text[textKey]) {
      const Component = getPlateRuntime(editor).components[textKey] as any;
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
  const textPropsEntries: Array<{ key: string; plugin: AnyBasePlugin }> = [];

  getPlateRuntime(editor).pluginCache.node.textMarks.forEach((name) => {
    const plugin = getCompiledPlatePlugin(editor, name)!;

    if (plugin) {
      renderTexts.push(pluginRenderTextStatic(editor, plugin as any));
    }
  });

  getPlateRuntime(editor).pluginCache.node.textProps.forEach((name) => {
    const plugin = getCompiledPlatePlugin(editor, name)!;
    const key = plugin
      ? getCompiledPlateModelBinding(editor, plugin)?.propertyKey
      : undefined;

    if (plugin && key) {
      textPropsEntries.push({ key, plugin });
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

    textPropsEntries.forEach(({ key, plugin }) => {
      if (props.text[key]) {
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
