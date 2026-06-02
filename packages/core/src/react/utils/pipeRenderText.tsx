import React from 'react';

import clsx from 'clsx';

import type { EditableProps } from '../../lib';
import type { PlateEditor } from '../editor/PlateEditor';
import type { AnyEditorPlatePlugin } from '../plugin';

import { getSlateClass } from '../../lib';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import { PlateText } from '../components/plate-nodes';
import { useReadOnly } from '../slate-react';
import { getRenderNodeProps } from './getRenderNodeProps';
import { type RenderText, pluginRenderText } from './pluginRenderText';

type SimpleRenderText = {
  className?: string;
  plugin: AnyEditorPlatePlugin;
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
  const textPropsPlugins: AnyEditorPlatePlugin[] = [];
  const hasInjectNodeProps =
    editor.meta.pluginCache.inject.nodeProps.length > 0;

  editor.meta.pluginList.forEach((plugin) => {
    if (plugin.node.isLeaf && plugin.node.isDecoration === false) {
      const canUsePlainText =
        !plugin.render.node &&
        !plugin.node.component &&
        !plugin.node.props &&
        !plugin.node.dangerouslyAllowAttributes?.length;

      if (canUsePlainText) {
        const entry = {
          className: getSlateClass(plugin.node.type) || undefined,
          plugin,
          tag: (plugin.render?.as ?? 'span') as keyof HTMLElementTagNameMap,
          textKey: plugin.node.type ?? plugin.key,
        };

        simpleRenderTexts.push(entry);
        simpleRenderTextByKey.set(entry.textKey, true);
      } else {
        const entry = {
          renderText: pluginRenderText(editor, plugin),
          textKey: plugin.node.type ?? plugin.key,
        };

        renderTexts.push(entry);
        renderTextByKey.set(entry.textKey, true);
      }
    }

    if (plugin.node.textProps) {
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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const readOnly = useReadOnly();
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
      for (const { renderText, textKey } of renderTexts) {
        if (!text[textKey]) continue;

        const newChildren = renderText(props as any);

        if (newChildren !== undefined) {
          props.children = newChildren;
        }
      }
    }

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
