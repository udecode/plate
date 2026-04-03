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

/** @see {@link RenderText} */
export const pipeRenderText = (
  editor: PlateEditor,
  renderTextProp?: EditableProps['renderText']
): EditableProps['renderText'] => {
  const renderTexts: RenderText[] = [];
  const simpleRenderTexts: SimpleRenderText[] = [];
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
        simpleRenderTexts.push({
          className: getSlateClass(plugin.node.type) || undefined,
          plugin,
          tag: (plugin.render?.as ?? 'span') as keyof HTMLElementTagNameMap,
          textKey: plugin.node.type ?? plugin.key,
        });
      } else {
        renderTexts.push(pluginRenderText(editor, plugin));
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

    simpleRenderTexts.forEach(({ className, plugin, tag: Tag, textKey }) => {
      if (isEditOnly(readOnly, plugin, 'render')) return;

      if (props.text[textKey]) {
        props.children = <Tag className={className}>{props.children}</Tag>;
      }
    });

    renderTexts.forEach((renderText) => {
      const newChildren = renderText(props as any);

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
