import { clsx } from 'clsx';
import * as React from 'react';

import { failInvariant } from '../../internal/failInvariant';
import {
  getCompiledPlateModelBinding,
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import type { AnyBasePlugin, EditableProps } from '../../lib';
import { getPluginNodeClass } from '../../lib';
import { PlateText } from '../components/plate-nodes';
import type { Editor } from '../editor/Editor';
import { setDOMTextSyncRendererCapability } from '../plite-react';
import { getRenderNodeProps } from './getRenderNodeProps.internal';
import { type RenderText, pluginRenderText } from './pluginRenderText.internal';
import { setRetainedTextFlowRendererCapability } from './retainedTextFlowRenderer.internal';

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

type TextAttributesEntry = {
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
  const textAttributeEntries: TextAttributesEntry[] = [];
  const plateRuntime = getPlateRuntime(editor);
  const hasInjectNodeProps =
    plateRuntime.pluginCache.inject.nodeProps.text.length > 0;
  const textInjectionPlugins =
    plateRuntime.pluginCache.inject.nodeProps.text.flatMap((name) => {
      const plugin =
        getCompiledPlatePlugin(editor, name) ??
        failInvariant('Expected value to be defined');
      const { nodeProps } = plugin.inject;
      const hasTextInjectionTransform = [
        nodeProps?.transformClassName,
        nodeProps?.transformNodeValue,
        nodeProps?.transformProps,
        nodeProps?.transformStyle,
      ].some((transform) => typeof transform === 'function');

      return hasTextInjectionTransform ? [plugin] : [];
    });
  const hasUnknownTextInjection = textInjectionPlugins.length > 0;

  plateRuntime.pluginList.forEach((plugin) => {
    const binding = getCompiledPlateModelBinding(editor, plugin);

    if (binding?.kind === 'mark' && binding.markPlacement === 'text') {
      const { component } = plugin;
      const canUsePlainText =
        (component === undefined || typeof component === 'string') &&
        !plugin.render.attributes;

      if (canUsePlainText) {
        const entry = {
          className: getPluginNodeClass(plugin.name) || undefined,
          plugin,
          tag: typeof component === 'string' ? component : 'span',
          textKey:
            binding.propertyKey ??
            failInvariant('Expected value to be defined'),
        };

        simpleRenderTexts.push(entry);
        simpleRenderTextByKey.set(entry.textKey, true);
      } else {
        const entry = {
          requiresModelTextSync: Boolean(
            (component && typeof component !== 'string') ||
            plugin.render.attributes
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

    if (plugin.render.mark?.textAttributes && binding?.propertyKey) {
      textAttributeEntries.push({ plugin, textKey: binding.propertyKey });
    }
  });

  if (
    !hasInjectNodeProps &&
    simpleRenderTexts.length === 0 &&
    renderTexts.length === 0 &&
    textAttributeEntries.length === 0
  ) {
    if (renderTextProp) {
      return renderTextProp;
    }

    return setRetainedTextFlowRendererCapability(
      setDOMTextSyncRendererCapability(
        ({ attributes, ...props }) => (
          <span {...attributes}>{props.children}</span>
        ),
        () => true
      ),
      () => true
    );
  }

  const canUsePlainOuterText =
    !hasInjectNodeProps && !renderTextProp && textAttributeEntries.length === 0;

  const renderer: NonNullable<EditableProps['renderText']> = ({
    attributes: initialAttributes,
    ...props
  }) => {
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

    textAttributeEntries.forEach(({ plugin, textKey }) => {
      if (isTextMarkActive(props.text, textKey)) {
        const textAttributes = plugin.render.mark?.textAttributes;
        const pluginTextProps =
          typeof textAttributes === 'function'
            ? textAttributes(props as any)
            : (textAttributes ?? {});

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
  };
  const resolveDOMTextSync: Parameters<
    typeof setDOMTextSyncRendererCapability
  >[1] = ({ marks }) =>
    !renderTextProp &&
    !hasUnknownTextInjection &&
    !renderTexts.some(
      ({ requiresModelTextSync, textKey }) =>
        requiresModelTextSync && isTextMarkActive(marks, textKey)
    ) &&
    !textAttributeEntries.some(({ textKey }) =>
      isTextMarkActive(marks, textKey)
    );

  return setRetainedTextFlowRendererCapability(
    setDOMTextSyncRendererCapability(renderer, resolveDOMTextSync),
    ({ marks }) =>
      !renderTextProp &&
      textInjectionPlugins.length === 0 &&
      Object.keys(marks).length === 0 &&
      resolveDOMTextSync({ marks })
  );
};
