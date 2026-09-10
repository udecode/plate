import { clsx } from 'clsx';
import React from 'react';

import { failInvariant } from '../internal/failInvariant';
import {
  getCompiledPlateModelBinding,
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../internal/plugin/compilePlateModel';
import type { Editor } from '../lib/editor/Editor';
import type {
  AnyBasePlugin,
  AnyBasePluginPortal,
  AnyPluginBase,
} from '../lib/plugin/BasePlugin';
import type { RenderTextProps } from '../lib/types/RenderTextProps';
import { PliteText } from './components';
import { getRenderNodeStaticProps } from './utils/getRenderNodeStaticProps.internal';

export type PliteRenderText = (
  props: RenderTextProps
) => React.ReactNode | undefined;

export const pluginRenderTextStatic = (
  editor: Editor,
  plugin: AnyBasePluginPortal | AnyPluginBase
): PliteRenderText =>
  function render(nodeProps) {
    const { children, text } = nodeProps;
    const textKey = getCompiledPlateModelBinding(editor, plugin)?.propertyKey;

    if (textKey && text[textKey]) {
      const { component } = plugin;
      const Component =
        component && typeof component !== 'string' ? component : undefined;
      const Text = Component ?? PliteText;

      const ctxProps = getRenderNodeStaticProps({
        editor,
        path: nodeProps.path,
        plugin,
        props: nodeProps as any,
      });

      const defaultProps =
        typeof component === 'string' ? { as: component } : {};

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
  editor: Editor,
  { renderText: renderTextProp }: { renderText?: PliteRenderText } = {}
): PliteRenderText => {
  const renderTexts: PliteRenderText[] = [];
  const textPropsEntries: Array<{ key: string; plugin: AnyBasePlugin }> = [];

  getPlateRuntime(editor).pluginCache.node.textRenderers.forEach((name) => {
    const plugin =
      getCompiledPlatePlugin(editor, name) ??
      failInvariant('Expected value to be defined');

    if (plugin) {
      renderTexts.push(pluginRenderTextStatic(editor, plugin));
    }
  });

  getPlateRuntime(editor).pluginCache.node.textAttributeMarks.forEach(
    (name) => {
      const plugin =
        getCompiledPlatePlugin(editor, name) ??
        failInvariant('Expected value to be defined');
      const key = plugin
        ? getCompiledPlateModelBinding(editor, plugin)?.propertyKey
        : undefined;

      if (plugin && key) {
        textPropsEntries.push({ key, plugin });
      }
    }
  );

  return function render({ attributes: initialAttributes, ...props }) {
    let attributes = initialAttributes;
    let { children } = props;

    renderTexts.forEach((renderText) => {
      const newChildren = renderText({ ...props, children } as any);

      if (newChildren !== undefined) {
        children = newChildren;
      }
    });

    textPropsEntries.forEach(({ key, plugin }) => {
      if (props.text[key]) {
        const textAttributes = plugin.render.mark?.textAttributes;
        const pluginTextProps =
          typeof textAttributes === 'function'
            ? textAttributes({ ...props, children } as any)
            : (textAttributes ?? {});

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
    });

    return <PliteText {...ctxProps} />;
  };
};
