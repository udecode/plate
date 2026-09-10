import { clsx } from 'clsx';
import React from 'react';

import { type Path, PathApi, TextApi } from '../../facade';
import { failInvariant } from '../../internal/failInvariant';
import {
  getCompiledPlateModelBinding,
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import type { EditableProps, EditOnlyConfig } from '../../lib';
import { PlateLeaf } from '../components';
import type { Editor } from '../editor/Editor';
import { setDOMTextSyncRendererCapability } from '../plite-react';
import type { AnyResolvedPlatePlugin } from '../plugin';
import { getRenderNodeProps } from './getRenderNodeProps.internal';
import { type RenderLeaf, pluginRenderLeaf } from './pluginRenderLeaf.internal';
import { setRetainedTextFlowRendererCapability } from './retainedTextFlowRenderer.internal';

const HARD_AFFINITY_SPACE = String.fromCodePoint(160);
const HARD_AFFINITY_SPACER_STYLE = {
  fontSize: 0,
  lineHeight: 0,
} as const;

const isActiveHardAffinityBoundary = (
  editor: Editor,
  path: Path | undefined
) => {
  if (!path) return false;
  const match = editor.read((state) => {
    if (!state.selection.isCollapsed()) return undefined;

    const selection = state.selection();
    const focus = selection?.focus;

    if (!focus) return undefined;

    const selectedText = state.nodes.get(focus.path)?.[0];

    return selectedText ? { focus, selectedText } : undefined;
  });

  if (!match || !TextApi.isText(match.selectedText)) return false;

  if (!PathApi.equals(match.focus.path, path)) return false;

  return (
    match.focus.offset === 0 ||
    match.focus.offset === match.selectedText.text.length
  );
};

/** @see {@link RenderLeaf} */
export const pipeRenderLeaf = (
  editor: Editor,
  renderLeafProp?: EditableProps['renderLeaf']
): EditableProps['renderLeaf'] => {
  const complexRenderLeafEntries: Array<{
    key: string;
    requiresModelTextSync: boolean;
    renderLeaf: RenderLeaf;
  }> = [];
  const renderLeafEntries: Array<{
    className?: string;
    editOnly?: boolean | EditOnlyConfig;
    key: string;
    selectionAffinity?: string;
    tag: keyof HTMLElementTagNameMap;
  }> = [];
  const renderLeafEntryByKey = new Map<string, true>();
  const leafAttributeEntries: Array<{
    key: string;
    plugin: AnyResolvedPlatePlugin;
  }> = [];
  const plateRuntime = getPlateRuntime(editor);
  const hasInjectNodeProps =
    plateRuntime.pluginCache.inject.nodeProps.text.length > 0;
  const textInjectionTransformScopes =
    plateRuntime.pluginCache.inject.nodeProps.text.flatMap((name) => {
      const plugin =
        getCompiledPlatePlugin(editor, name) ??
        failInvariant('Expected value to be defined');
      const nodeProps = plugin.inject?.nodeProps;
      const hasTextInjectionTransform = [
        nodeProps?.transformClassName,
        nodeProps?.transformNodeValue,
        nodeProps?.transformProps,
        nodeProps?.transformStyle,
      ].some((transform) => typeof transform === 'function');

      return hasTextInjectionTransform
        ? [{ keys: [] as string[], wildcard: true }]
        : [];
    });

  const renderLeafPluginNames = new Set(
    plateRuntime.pluginCache.node.leafRenderers
  );

  renderLeafPluginNames.forEach((name) => {
    const plugin =
      getCompiledPlatePlugin(editor, name) ??
      failInvariant('Expected value to be defined');

    if (plugin) {
      const leafKey =
        getCompiledPlateModelBinding(editor, plugin)?.propertyKey ?? undefined;

      if (!leafKey) return;
      const { component: pluginComponent } = plugin;
      const { mark } = plugin.render;
      const component =
        mark?.leafComponent ??
        (mark?.placement === 'text' ? undefined : pluginComponent);
      const canUseSimpleLeaf =
        Boolean(leafKey) &&
        plateRuntime.pluginCache.inject.nodeProps.text.length === 0 &&
        (component === undefined || typeof component === 'string') &&
        !plugin.render.attributes &&
        (!plugin.rules.selection?.affinity ||
          plugin.rules.selection?.affinity === 'hard');

      if (canUseSimpleLeaf && leafKey) {
        const entry = {
          className: plugin.name ? `plite-${plugin.name}` : undefined,
          editOnly: plugin.editOnly,
          key: leafKey,
          selectionAffinity: plugin.rules.selection?.affinity,
          tag: typeof component === 'string' ? component : 'span',
        };

        renderLeafEntries.push(entry);
        renderLeafEntryByKey.set(leafKey, true);
      } else {
        const entry = {
          key: leafKey,
          requiresModelTextSync: Boolean(
            (component && typeof component !== 'string') ||
            plugin.render.attributes
          ),
          renderLeaf: pluginRenderLeaf(editor, plugin as any, {
            assumeActive: true,
          }),
        };

        complexRenderLeafEntries.push(entry);
      }
    }
  });

  plateRuntime.pluginCache.node.leafAttributeMarks.forEach((name) => {
    const plugin =
      getCompiledPlatePlugin(editor, name) ??
      failInvariant('Expected value to be defined');
    const key = plugin
      ? getCompiledPlateModelBinding(editor, plugin)?.propertyKey
      : undefined;

    if (plugin && key) {
      leafAttributeEntries.push({ key, plugin: plugin as any });
    }
  });

  if (
    !hasInjectNodeProps &&
    renderLeafEntries.length === 0 &&
    complexRenderLeafEntries.length === 0 &&
    leafAttributeEntries.length === 0
  ) {
    if (renderLeafProp) {
      return renderLeafProp;
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

  const canUsePlainOuterLeaf =
    !hasInjectNodeProps && !renderLeafProp && leafAttributeEntries.length === 0;

  const renderer: NonNullable<EditableProps['renderLeaf']> = ({
    attributes: initialAttributes,
    ...props
  }) => {
    let attributes = initialAttributes;
    const readOnly = editor.read.view.isReadOnly();
    const { leaf } = props;
    let hasActiveSimpleRenderLeaf = false;

    for (const key in leaf) {
      if (!Object.hasOwn(leaf, key)) continue;

      if (!hasActiveSimpleRenderLeaf && renderLeafEntryByKey.has(key)) {
        hasActiveSimpleRenderLeaf = true;
      }

      if (hasActiveSimpleRenderLeaf) break;
    }

    const hasActiveComplexRenderLeaf = complexRenderLeafEntries.some(
      ({ key }) => Boolean(leaf[key])
    );

    if (hasActiveSimpleRenderLeaf) {
      for (const {
        className,
        editOnly,
        key,
        selectionAffinity,
        tag: Tag,
      } of renderLeafEntries) {
        if (!leaf[key]) continue;

        if (editOnly && isEditOnly(readOnly, { editOnly }, 'render')) {
          continue;
        }

        if (selectionAffinity === 'hard') {
          const showBoundarySpacers = isActiveHardAffinityBoundary(
            editor,
            props.path
          );

          if (!showBoundarySpacers) {
            props.children = <Tag className={className}>{props.children}</Tag>;

            continue;
          }

          props.children = (
            <>
              <span contentEditable={false} style={HARD_AFFINITY_SPACER_STYLE}>
                {HARD_AFFINITY_SPACE}
              </span>
              <Tag className={className}>
                {props.children}
                <span
                  contentEditable={false}
                  style={HARD_AFFINITY_SPACER_STYLE}
                >
                  {HARD_AFFINITY_SPACE}
                </span>
              </Tag>
            </>
          );

          continue;
        }

        props.children = <Tag className={className}>{props.children}</Tag>;
      }
    }

    if (hasActiveComplexRenderLeaf) {
      for (const { key, renderLeaf: RenderLeaf } of complexRenderLeafEntries) {
        if (!leaf[key]) continue;

        props.children = (
          <RenderLeaf {...(props as any)}>{props.children}</RenderLeaf>
        );
      }
    }

    leafAttributeEntries.forEach(({ key, plugin }) => {
      if (props.leaf[key]) {
        const leafAttributes = plugin.render.mark?.leafAttributes;
        const pluginLeafProps =
          typeof leafAttributes === 'function'
            ? leafAttributes(props as any)
            : (leafAttributes ?? {});

        attributes = {
          ...attributes,
          ...pluginLeafProps,
          ...(pluginLeafProps.className && {
            className: clsx(
              (props as any).className,
              pluginLeafProps.className
            ),
          }),
        };
      }
    });

    if (canUsePlainOuterLeaf) {
      return <span {...attributes}>{props.children}</span>;
    }

    if (renderLeafProp) {
      return renderLeafProp({ attributes, ...props });
    }

    const ctxProps = getRenderNodeProps({
      editor,
      props: { attributes, ...props } as any,
      readOnly,
    });

    return <PlateLeaf {...ctxProps}>{props.children}</PlateLeaf>;
  };
  const resolveDOMTextSync: Parameters<
    typeof setDOMTextSyncRendererCapability
  >[1] = ({ marks }) => {
    const hasActiveTextInjectionTransform = textInjectionTransformScopes.some(
      ({ keys, wildcard }) =>
        wildcard || keys.some((key) => Boolean(marks[key]))
    );

    return (
      !renderLeafProp &&
      !hasActiveTextInjectionTransform &&
      !complexRenderLeafEntries.some(
        ({ key, requiresModelTextSync }) =>
          requiresModelTextSync && Boolean(marks[key])
      ) &&
      !leafAttributeEntries.some(({ key }) => Boolean(marks[key]))
    );
  };

  return setRetainedTextFlowRendererCapability(
    setDOMTextSyncRendererCapability(renderer, resolveDOMTextSync),
    ({ marks }) =>
      !renderLeafProp &&
      textInjectionTransformScopes.length === 0 &&
      Object.keys(marks).length === 0 &&
      resolveDOMTextSync({ marks })
  );
};
