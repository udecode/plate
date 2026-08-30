import { clsx } from 'clsx';
import * as React from 'react';

import { failInvariant } from '../../internal/failInvariant';
import {
  getCompiledPlateModelBinding,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import type { AnyBasePlugin, EditableProps } from '../../lib';
import { getPluginNodeClass } from '../../lib';
import { PlateText } from '../components/plate-nodes';
import type { Editor } from '../editor/Editor';
import { setDOMTextSyncRendererCapability } from '../plite-react';
import { getRenderNodeProps } from './getRenderNodeProps';
import { type RenderText, pluginRenderText } from './pluginRenderText';

type SimpleRenderText = {
  className?: string;
  plugin: AnyBasePlugin;
  tag: keyof HTMLElementTagNameMap;
  textKey: string;
};

type RenderTextEntry = {
  requiresModelTextSync: boolean;
  renderText: RenderText;
  textKey: string;
};

type TextPropsEntry = {
  plugin: AnyBasePlugin;
  textKey: string;
};

const isTextMarkActive = (marks: Record<string, unknown>, textKey: string) =>
  Object.hasOwn(marks, textKey) &&
  marks[textKey] !== false &&
  marks[textKey] !== undefined;

/** @see {@link RenderText} */
export const pipeRenderText = (
  editor: Editor,
  renderTextProp?: EditableProps['renderText']
): EditableProps['renderText'] => {
  const renderTexts: RenderTextEntry[] = [];
  const renderTextByKey = new Map<string, true>();
  const simpleRenderTexts: SimpleRenderText[] = [];
  const simpleRenderTextByKey = new Map<string, true>();
  const textPropsEntries: TextPropsEntry[] = [];
  const plateRuntime = getPlateRuntime(editor);
  const hasInjectNodeProps =
    plateRuntime.pluginCache.inject.nodeProps.length > 0;
  const hasUnknownTextInjection = plateRuntime.pluginList.some((plugin) => {
    const nodeProps = plugin.inject?.nodeProps;
    const hasTextInjectionTransform = [
      nodeProps?.transformClassName,
      nodeProps?.transformNodeValue,
      nodeProps?.transformProps,
      nodeProps?.transformStyle,
    ].some((transform) => typeof transform === 'function');

    return (
      hasTextInjectionTransform &&
      !plugin.inject.isBlock &&
      !plugin.inject.isElement &&
      plugin.targetPlugins.length === 0
    );
  });

  plateRuntime.pluginList.forEach((plugin) => {
    const binding = getCompiledPlateModelBinding(editor, plugin);

    if (binding?.kind === 'mark' && !binding.isDecoration) {
      const canUsePlainText = !plugin.render.node && !plugin.render.nodeProps;

      if (canUsePlainText) {
        const entry = {
          className: getPluginNodeClass(plugin.name) || undefined,
          plugin,
          tag: plugin.render?.as ?? 'span',
          textKey:
            binding.propertyKey ??
            failInvariant('Expected value to be defined'),
        };

        simpleRenderTexts.push(entry);
        simpleRenderTextByKey.set(entry.textKey, true);
      } else {
        const entry = {
          requiresModelTextSync: Boolean(
            plugin.render.node || plugin.render.nodeProps
          ),
          renderText: pluginRenderText(editor, plugin),
          textKey:
            binding.propertyKey ??
            failInvariant('Expected value to be defined'),
        };

        renderTexts.push(entry);
        renderTextByKey.set(entry.textKey, true);
      }
    }

    if (plugin.render.textProps && binding?.propertyKey) {
      textPropsEntries.push({ plugin, textKey: binding.propertyKey });
    }
  });

  if (
    !hasInjectNodeProps &&
    simpleRenderTexts.length === 0 &&
    renderTexts.length === 0 &&
    textPropsEntries.length === 0
  ) {
    if (renderTextProp) {
      return renderTextProp;
    }

    return setDOMTextSyncRendererCapability(
      ({ attributes, ...props }) => (
        <span {...attributes}>{props.children}</span>
      ),
      () => true
    );
  }

  const canUsePlainOuterText =
    !hasInjectNodeProps && !renderTextProp && textPropsEntries.length === 0;

  return setDOMTextSyncRendererCapability(
    ({ attributes: initialAttributes, ...props }) => {
      let attributes = initialAttributes;
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
          if (!isTextMarkActive(text, textKey)) continue;
          if (isEditOnly(readOnly, plugin, 'render')) continue;

          props.children = <Tag className={className}>{props.children}</Tag>;
        }
      }

      if (hasActiveRenderText) {
        for (const { renderText: RenderText, textKey } of renderTexts) {
          if (!isTextMarkActive(text, textKey)) continue;

          props.children = (
            <RenderText {...(props as any)}>{props.children}</RenderText>
          );
        }
      }

      textPropsEntries.forEach(({ plugin, textKey }) => {
        if (isTextMarkActive(props.text, textKey)) {
          const pluginTextProps =
            typeof plugin.render.textProps === 'function'
              ? plugin.render.textProps(props as any)
              : (plugin.render.textProps ?? {});

          attributes = {
            ...attributes,
            ...pluginTextProps,
            ...(pluginTextProps.className && {
              className: clsx(attributes.className, pluginTextProps.className),
            }),
          };
        }
      });

      if (canUsePlainOuterText) {
        return <span {...attributes}>{props.children}</span>;
      }

      if (renderTextProp) {
        return renderTextProp({ attributes, ...props });
      }

      const ctxProps = getRenderNodeProps({
        editor,
        props: { attributes, ...props } as any,
        readOnly,
      });

      return <PlateText {...ctxProps}>{props.children}</PlateText>;
    },
    ({ marks }) =>
      !renderTextProp &&
      !hasUnknownTextInjection &&
      !renderTexts.some(
        ({ requiresModelTextSync, textKey }) =>
          requiresModelTextSync && isTextMarkActive(marks, textKey)
      ) &&
      !textPropsEntries.some(({ textKey }) => isTextMarkActive(marks, textKey))
  );
};
