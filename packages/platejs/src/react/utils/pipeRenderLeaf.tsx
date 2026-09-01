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
import { PLATE_PLUGIN_DECORATION_SOURCE } from '../internal/PlatePluginDecorationSources';
import { setDOMTextSyncRendererCapability } from '../plite-react';
import type { AnyResolvedPlatePlugin } from '../plugin';
import { getRenderNodeProps } from './getRenderNodeProps';
import { type RenderLeaf, pluginRenderLeaf } from './pluginRenderLeaf';

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

const getDecoratedLeaf = (
  leaf: Record<string, unknown>,
  segment?: {
    slices?: ReadonlyArray<{ data?: unknown }>;
  }
) => {
  let decoratedLeaf = leaf;

  for (const slice of segment?.slices ?? []) {
    if (
      typeof slice.data !== 'object' ||
      slice.data === null ||
      Array.isArray(slice.data)
    ) {
      continue;
    }

    if (decoratedLeaf === leaf) {
      decoratedLeaf = { ...leaf };
    }

    const {
      merge,
      [PLATE_PLUGIN_DECORATION_SOURCE]: _pluginName,
      ...decoration
    } = slice.data as Record<string, unknown>;

    if (typeof merge === 'function') {
      merge(decoratedLeaf, decoration);
    } else {
      Object.assign(decoratedLeaf, decoration);
    }
  }

  return decoratedLeaf;
};

const getDecorationPluginNames = (segment?: {
  slices?: ReadonlyArray<{ data?: unknown }>;
}) => {
  const names = new Set<string>();

  for (const slice of segment?.slices ?? []) {
    if (typeof slice.data !== 'object' || slice.data === null) continue;

    const name = (slice.data as Record<string, unknown>)[
      PLATE_PLUGIN_DECORATION_SOURCE
    ];

    if (typeof name === 'string') names.add(name);
  }

  return names;
};

/** @see {@link RenderLeaf} */
export const pipeRenderLeaf = (
  editor: Editor,
  renderLeafProp?: EditableProps['renderLeaf']
): EditableProps['renderLeaf'] => {
  const complexRenderLeafEntries: Array<{
    key?: string;
    pluginName: string;
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
  const leafPropsEntries: Array<{
    key: string;
    plugin: AnyResolvedPlatePlugin;
  }> = [];
  const plateRuntime = getPlateRuntime(editor);
  const hasInjectNodeProps =
    plateRuntime.pluginCache.inject.nodeProps.length > 0;
  const textInjectionTransformScopes = plateRuntime.pluginList.flatMap(
    (plugin) => {
      const nodeProps = plugin.inject?.nodeProps;
      const hasTextInjectionTransform = [
        nodeProps?.transformClassName,
        nodeProps?.transformNodeValue,
        nodeProps?.transformProps,
        nodeProps?.transformStyle,
      ].some((transform) => typeof transform === 'function');

      if (
        !hasTextInjectionTransform ||
        plugin.inject.isBlock ||
        plugin.inject.isElement
      ) {
        return [];
      }
      if (plugin.targetPlugins.length === 0) {
        return [{ keys: [] as string[], wildcard: true }];
      }
      let unresolved = false;
      const keys = plugin.targetPlugins.flatMap((target) => {
        const binding = getCompiledPlateModelBinding(editor, target);

        if (!binding) {
          unresolved = true;
          return [];
        }

        return binding.propertyKey ? [binding.propertyKey] : [];
      });

      return [{ keys, wildcard: unresolved }];
    }
  );

  const renderLeafPluginNames = new Set([
    ...plateRuntime.pluginCache.node.decoratedMarks,
    ...plateRuntime.pluginCache.decorate,
  ]);

  renderLeafPluginNames.forEach((name) => {
    const plugin =
      getCompiledPlatePlugin(editor, name) ??
      failInvariant('Expected value to be defined');

    if (plugin) {
      const leafKey =
        getCompiledPlateModelBinding(editor, plugin)?.propertyKey ?? undefined;
      const hasTransientLeaf = Boolean(plugin.decorate && plugin.render.leaf);

      if (!leafKey && !hasTransientLeaf) return;
      const canUseSimpleLeaf =
        Boolean(leafKey) &&
        plateRuntime.pluginCache.inject.nodeProps.length === 0 &&
        !plugin.render?.leaf &&
        !plugin.render?.node &&
        !plugin.render.nodeProps &&
        (!plugin.rules.selection?.affinity ||
          plugin.rules.selection?.affinity === 'hard');

      if (canUseSimpleLeaf && leafKey) {
        const entry = {
          className: plugin.name ? `plite-${plugin.name}` : undefined,
          editOnly: plugin.editOnly,
          key: leafKey,
          selectionAffinity: plugin.rules.selection?.affinity,
          tag: plugin.render?.as ?? 'span',
        };

        renderLeafEntries.push(entry);
        renderLeafEntryByKey.set(leafKey, true);
      } else {
        const entry = {
          key: leafKey,
          pluginName: plugin.name,
          requiresModelTextSync: Boolean(
            (plugin as { component?: unknown }).component ||
            plugin.render.leaf ||
            plugin.render.node ||
            plugin.render.nodeProps
          ),
          renderLeaf: pluginRenderLeaf(editor, plugin as any, {
            assumeActive: true,
          }),
        };

        complexRenderLeafEntries.push(entry);
      }
    }
  });

  plateRuntime.pluginCache.node.leafProps.forEach((name) => {
    const plugin =
      getCompiledPlatePlugin(editor, name) ??
      failInvariant('Expected value to be defined');
    const key = plugin
      ? getCompiledPlateModelBinding(editor, plugin)?.propertyKey
      : undefined;

    if (plugin && key) {
      leafPropsEntries.push({ key, plugin: plugin as any });
    }
  });

  if (
    !hasInjectNodeProps &&
    renderLeafEntries.length === 0 &&
    complexRenderLeafEntries.length === 0 &&
    leafPropsEntries.length === 0
  ) {
    if (renderLeafProp) {
      return renderLeafProp;
    }

    return setDOMTextSyncRendererCapability(
      ({ attributes, ...props }) => (
        <span {...attributes}>{props.children}</span>
      ),
      () => true
    );
  }

  const canUsePlainOuterLeaf =
    !hasInjectNodeProps && !renderLeafProp && leafPropsEntries.length === 0;

  return setDOMTextSyncRendererCapability(
    ({ attributes: initialAttributes, ...props }) => {
      let attributes = initialAttributes;
      const readOnly = editor.read.view.isReadOnly();
      const leaf = getDecoratedLeaf(props.leaf, (props as any).segment);
      const decorationPluginNames = getDecorationPluginNames(
        (props as any).segment
      );
      let hasActiveSimpleRenderLeaf = false;

      props.leaf = leaf;

      for (const key in leaf) {
        if (!Object.hasOwn(leaf, key)) continue;

        if (!hasActiveSimpleRenderLeaf && renderLeafEntryByKey.has(key)) {
          hasActiveSimpleRenderLeaf = true;
        }

        if (hasActiveSimpleRenderLeaf) break;
      }

      const hasActiveComplexRenderLeaf = complexRenderLeafEntries.some(
        ({ key, pluginName }) =>
          (key ? Boolean(leaf[key]) : false) ||
          decorationPluginNames.has(pluginName)
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
              props.children = (
                <Tag className={className}>{props.children}</Tag>
              );

              continue;
            }

            props.children = (
              <>
                <span
                  contentEditable={false}
                  style={HARD_AFFINITY_SPACER_STYLE}
                >
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
        for (const {
          key,
          pluginName,
          renderLeaf: RenderLeaf,
        } of complexRenderLeafEntries) {
          if (
            !(key ? leaf[key] : false) &&
            !decorationPluginNames.has(pluginName)
          ) {
            continue;
          }

          props.children = (
            <RenderLeaf {...(props as any)}>{props.children}</RenderLeaf>
          );
        }
      }

      leafPropsEntries.forEach(({ key, plugin }) => {
        if (props.leaf[key]) {
          const pluginLeafProps =
            typeof plugin.render.leafProps === 'function'
              ? plugin.render.leafProps(props as any)
              : (plugin.render.leafProps ?? {});

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
    },
    ({ marks, projections }) => {
      const decoratedMarks = getDecoratedLeaf(marks, { slices: projections });
      const decorationPluginNames = getDecorationPluginNames({
        slices: projections,
      });
      const hasActiveTextInjectionTransform = textInjectionTransformScopes.some(
        ({ keys, wildcard }) =>
          wildcard || keys.some((key) => Boolean(decoratedMarks[key]))
      );

      return (
        !renderLeafProp &&
        !hasActiveTextInjectionTransform &&
        !complexRenderLeafEntries.some(
          ({ key, pluginName, requiresModelTextSync }) =>
            requiresModelTextSync &&
            ((key ? Boolean(decoratedMarks[key]) : false) ||
              decorationPluginNames.has(pluginName))
        ) &&
        !leafPropsEntries.some(({ key }) => Boolean(decoratedMarks[key]))
      );
    }
  );
};
