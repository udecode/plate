import React from 'react';

import clsx from 'clsx';

import type { EditableProps, EditOnlyConfig } from '../../lib';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import type { PlateEditor } from '../editor/PlateEditor';
import type { AnyEditorPlatePlugin } from '../plugin';

import { PlateLeaf } from '../components';
import { getRenderNodeProps } from './getRenderNodeProps';
import { type RenderLeaf, pluginRenderLeaf } from './pluginRenderLeaf';

const HARD_AFFINITY_SPACE = String.fromCodePoint(160);
const HARD_AFFINITY_SPACER_STYLE = {
  fontSize: 0,
  lineHeight: 0,
} as const;

const isActiveHardAffinityBoundary = (editor: PlateEditor, text: any) => {
  const match = editor.read((state) => {
    if (!state.selection.isCollapsed()) return;

    const focus = state.selection()?.focus;

    if (!focus) return;

    const selectedText = state.nodes.get(focus.path)?.[0];

    return selectedText ? { focus, selectedText } : undefined;
  });

  if (!match) return false;

  if (match.selectedText !== text) return false;

  return match.focus.offset === 0 || match.focus.offset === text.text.length;
};

const getDecoratedLeaf = (
  leaf: Record<string, unknown>,
  segment?: {
    slices?: readonly { data?: unknown }[];
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

    const { merge, ...decoration } = slice.data as Record<string, unknown>;

    if (typeof merge === 'function') {
      merge(decoratedLeaf, decoration);
    } else {
      Object.assign(decoratedLeaf, decoration);
    }
  }

  return decoratedLeaf;
};

/** @see {@link RenderLeaf} */
export const pipeRenderLeaf = (
  editor: PlateEditor,
  renderLeafProp?: EditableProps['renderLeaf']
): EditableProps['renderLeaf'] => {
  const complexRenderLeafEntries: Array<{
    key: string;
    renderLeaf: RenderLeaf;
  }> = [];
  const complexRenderLeafEntryByKey = new Map<string, RenderLeaf>();
  const renderLeafEntries: Array<{
    className?: string;
    editOnly?: boolean | EditOnlyConfig;
    key: string;
    selectionAffinity?: string;
    tag: keyof HTMLElementTagNameMap;
  }> = [];
  const renderLeafEntryByKey = new Map<string, true>();
  const leafPropsPlugins: AnyEditorPlatePlugin[] = [];
  const hasInjectNodeProps =
    getPlateRuntime(editor).pluginCache.inject.nodeProps.length > 0;

  getPlateRuntime(editor).pluginCache.node.decoratedMarks.forEach(
    (pluginName) => {
      const plugin = getCompiledPlatePlugin(editor, pluginName)!;

      if (plugin) {
        const leafKey = plugin.type;
        const canUseSimpleLeaf =
          getPlateRuntime(editor).pluginCache.inject.nodeProps.length === 0 &&
          !plugin.render?.leaf &&
          !plugin.render?.node &&
          !plugin.render.nodeProps &&
          (!plugin.rules.selection?.affinity ||
            plugin.rules.selection?.affinity === 'hard');

        if (canUseSimpleLeaf) {
          const entry = {
            className: plugin.type ? `plite-${plugin.type}` : undefined,
            editOnly: plugin.editOnly,
            key: leafKey,
            selectionAffinity: plugin.rules.selection?.affinity,
            tag: (plugin.render?.as ?? 'span') as keyof HTMLElementTagNameMap,
          };

          renderLeafEntries.push(entry);
          renderLeafEntryByKey.set(leafKey, true);
        } else {
          const entry = {
            key: leafKey,
            renderLeaf: pluginRenderLeaf(editor, plugin as any),
          };

          complexRenderLeafEntries.push(entry);
          complexRenderLeafEntryByKey.set(leafKey, entry.renderLeaf);
        }
      }
    }
  );

  getPlateRuntime(editor).pluginCache.node.leafProps.forEach((pluginName) => {
    const plugin = getCompiledPlatePlugin(editor, pluginName)!;
    if (plugin) {
      leafPropsPlugins.push(plugin as any);
    }
  });

  if (
    !hasInjectNodeProps &&
    renderLeafEntries.length === 0 &&
    complexRenderLeafEntries.length === 0 &&
    leafPropsPlugins.length === 0
  ) {
    if (renderLeafProp) {
      return renderLeafProp;
    }

    return function render({ attributes, ...props }) {
      return <span {...attributes}>{props.children}</span>;
    };
  }

  const canUsePlainOuterLeaf =
    !hasInjectNodeProps && !renderLeafProp && leafPropsPlugins.length === 0;

  return function render({ attributes, ...props }) {
    const readOnly = editor.read.view.isReadOnly();
    const leaf = getDecoratedLeaf(
      props.leaf as Record<string, unknown>,
      (props as any).segment
    );
    let hasActiveSimpleRenderLeaf = false;
    let hasActiveComplexRenderLeaf = false;

    props.leaf = leaf as any;

    for (const key in leaf) {
      if (!Object.hasOwn(leaf, key)) continue;

      if (!hasActiveSimpleRenderLeaf && renderLeafEntryByKey.has(key)) {
        hasActiveSimpleRenderLeaf = true;
      }

      if (!hasActiveComplexRenderLeaf && complexRenderLeafEntryByKey.has(key)) {
        hasActiveComplexRenderLeaf = true;
      }

      if (hasActiveSimpleRenderLeaf && hasActiveComplexRenderLeaf) break;
    }

    if (hasActiveSimpleRenderLeaf) {
      for (const {
        className,
        editOnly,
        key,
        selectionAffinity,
        tag: Tag,
      } of renderLeafEntries) {
        if (!leaf[key]) continue;

        if (editOnly && isEditOnly(readOnly, { editOnly } as any, 'render')) {
          continue;
        }

        if (selectionAffinity === 'hard') {
          const showBoundarySpacers = isActiveHardAffinityBoundary(
            editor,
            props.text
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

    leafPropsPlugins.forEach((plugin) => {
      if (props.leaf[plugin.type]) {
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
      return renderLeafProp({ attributes, ...props } as any);
    }

    const ctxProps = getRenderNodeProps({
      editor,
      props: { attributes, ...props } as any,
      readOnly,
    }) as any;

    return <PlateLeaf {...ctxProps}>{props.children}</PlateLeaf>;
  };
};
