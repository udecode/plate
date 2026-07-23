import React from 'react';

import clsx from 'clsx';

import type { AnyBasePlugin, EditableProps } from '../../lib';
import type { PlateEditor } from '../editor/PlateEditor';

import { getPluginNodeClass } from '../../lib';
import {
  getCompiledPlateModelBinding,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import { PlateText } from '../components/plate-nodes';
import { getRenderNodeProps } from './getRenderNodeProps';
import { type RenderText, pluginRenderText } from './pluginRenderText';

type SimpleRenderText = {
  className?: string;
  plugin: AnyBasePlugin;
  tag: keyof HTMLElementTagNameMap;
  textKey: string;
};

type RenderTextEntry = {
  renderText: RenderText;
  textKey: string;
};

/** @see {@link RenderText} */
export const pipeRenderText = (
  editor: PlateEditor,
  renderTextProp?: EditableProps['renderText']
): EditableProps['renderText'] => {
  const renderTexts: RenderTextEntry[] = [];
  const renderTextByKey = new Map<string, true>();
  const simpleRenderTexts: SimpleRenderText[] = [];
  const simpleRenderTextByKey = new Map<string, true>();
  const textPropsPlugins: AnyBasePlugin[] = [];
  const hasInjectNodeProps =
    getPlateRuntime(editor).pluginCache.inject.nodeProps.length > 0;

  getPlateRuntime(editor).pluginList.forEach((plugin) => {
    const binding = getCompiledPlateModelBinding(editor, plugin);

    if (binding?.kind === 'mark' && !binding.isDecoration) {
      const canUsePlainText =
        !plugin.render.node &&
        !plugin.render.nodeProps &&
        !plugin.host.dangerouslyAllowAttributes?.length;

      if (canUsePlainText) {
        const entry = {
          className: getPluginNodeClass(plugin.type) || undefined,
          plugin,
          tag: (plugin.render?.as ?? 'span') as keyof HTMLElementTagNameMap,
          textKey: plugin.type,
        };

        simpleRenderTexts.push(entry);
        simpleRenderTextByKey.set(entry.textKey, true);
      } else {
        const entry = {
          renderText: pluginRenderText(editor, plugin),
          textKey: plugin.type,
        };

        renderTexts.push(entry);
        renderTextByKey.set(entry.textKey, true);
      }
    }

    if (plugin.render.textProps) {
      textPropsPlugins.push(plugin);
    }
  });

  if (
    !hasInjectNodeProps &&
    simpleRenderTexts.length === 0 &&
    renderTexts.length === 0 &&
    textPropsPlugins.length === 0
  ) {
    if (renderTextProp) {
      return renderTextProp;
    }

    return function render({ attributes, ...props }) {
      return <span {...attributes}>{props.children}</span>;
    };
  }

  const canUsePlainOuterText =
    !hasInjectNodeProps && !renderTextProp && textPropsPlugins.length === 0;

  return function render({ attributes, ...props }) {
    const readOnly = editor.read.view.isReadOnly();
    const text = props.text as Record<string, unknown>;
    let hasActiveSimpleRenderText = false;
    let hasActiveRenderText = false;

    for (const textKey in text) {
      if (!Object.hasOwn(text, textKey)) continue;

      if (!hasActiveSimpleRenderText && simpleRenderTextByKey.has(textKey)) {
        hasActiveSimpleRenderText = true;
      }

      if (!hasActiveRenderText && renderTextByKey.has(textKey)) {
        hasActiveRenderText = true;
      }

      if (hasActiveSimpleRenderText && hasActiveRenderText) break;
    }

    if (hasActiveSimpleRenderText) {
      for (const {
        className,
        plugin,
        tag: Tag,
        textKey,
      } of simpleRenderTexts) {
        if (!text[textKey]) continue;
        if (isEditOnly(readOnly, plugin, 'render')) continue;

        props.children = <Tag className={className}>{props.children}</Tag>;
      }
    }

    if (hasActiveRenderText) {
      for (const { renderText: RenderText, textKey } of renderTexts) {
        if (!text[textKey]) continue;

        props.children = (
          <RenderText {...(props as any)}>{props.children}</RenderText>
        );
      }
    }

    textPropsPlugins.forEach((plugin) => {
      if (props.text[plugin.type]) {
        const pluginTextProps =
          typeof plugin.render.textProps === 'function'
            ? plugin.render.textProps(props as any)
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

    if (canUsePlainOuterText) {
      return <span {...attributes}>{props.children}</span>;
    }

    if (renderTextProp) {
      return renderTextProp({ attributes, ...props } as any);
    }

    const ctxProps = getRenderNodeProps({
      editor,
      props: { attributes, ...props } as any,
      readOnly,
    }) as any;

    return <PlateText {...ctxProps}>{props.children}</PlateText>;
  };
};
