import React from 'react';

import { NodeApi } from '@platejs/slate';
import clsx from 'clsx';

import type { EditableProps } from '../../lib';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import type { PlateEditor } from '../editor/PlateEditor';
import type { AnyEditorPlatePlugin } from '../plugin';

import { PlateLeaf } from '../components';
import { useReadOnly } from '../slate-react';
import { getRenderNodeProps } from './getRenderNodeProps';
import { type RenderLeaf, pluginRenderLeaf } from './pluginRenderLeaf';

const HARD_AFFINITY_SPACE = String.fromCodePoint(160);
const HARD_AFFINITY_SPACER_STYLE = {
  fontSize: 0,
  lineHeight: 0,
} as const;

const isActiveHardAffinityBoundary = (editor: PlateEditor, text: any) => {
  if (!editor.api.isCollapsed()) return false;

  const focus = editor.selection?.focus;

  if (!focus) return false;

  const selectedText = NodeApi.get(editor, focus.path);

  if (selectedText !== text) return false;

  return focus.offset === 0 || focus.offset === text.text.length;
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
    editOnly?: boolean | Record<string, unknown>;
    key: string;
    selectionAffinity?: string;
    tag: keyof HTMLElementTagNameMap;
  }> = [];
  const renderLeafEntryByKey = new Map<string, true>();
  const leafPropsPlugins: AnyEditorPlatePlugin[] = [];
  const hasInjectNodeProps =
    editor.meta.pluginCache.inject.nodeProps.length > 0;

  editor.meta.pluginCache.node.isLeaf.forEach((key) => {
    const plugin = editor.getPlugin({ key });

    if (plugin) {
      const canUseSimpleLeaf =
        editor.meta.pluginCache.inject.nodeProps.length === 0 &&
        !plugin.render?.leaf &&
        !plugin.render?.node &&
        !plugin.node.props &&
        !plugin.node.dangerouslyAllowAttributes?.length &&
        (!plugin.rules.selection?.affinity ||
          plugin.rules.selection?.affinity === 'hard');

      if (canUseSimpleLeaf) {
        const entry = {
          className: plugin.node.type ? `slate-${plugin.node.type}` : undefined,
          editOnly: plugin.editOnly,
          key,
          selectionAffinity: plugin.rules.selection?.affinity,
          tag: (plugin.render?.as ?? 'span') as keyof HTMLElementTagNameMap,
        };

        renderLeafEntries.push(entry);
        renderLeafEntryByKey.set(key, true);
      } else {
        const entry = {
          key,
          renderLeaf: pluginRenderLeaf(editor, plugin as any),
        };

        complexRenderLeafEntries.push(entry);
        complexRenderLeafEntryByKey.set(key, entry.renderLeaf);
      }
    }
  });

  editor.meta.pluginCache.node.leafProps.forEach((key) => {
    const plugin = editor.getPlugin({ key });
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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const readOnly = useReadOnly();
    const leaf = props.leaf as Record<string, unknown>;
    let hasActiveSimpleRenderLeaf = false;
    let hasActiveComplexRenderLeaf = false;

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
      for (const { key, renderLeaf } of complexRenderLeafEntries) {
        if (!leaf[key]) continue;

        const newChildren = renderLeaf(props as any);

        if (newChildren !== undefined) {
          props.children = newChildren;
        }
      }
    }

    leafPropsPlugins.forEach((plugin) => {
      if (props.leaf[plugin.node.type]) {
        const pluginLeafProps =
          typeof plugin.node.leafProps === 'function'
            ? plugin.node.leafProps(props as any)
            : (plugin.node.leafProps ?? {});

        if (pluginLeafProps.className) {
          pluginLeafProps.className = clsx(
            (props as any).className,
            pluginLeafProps.className
          );
        }

        attributes = {
          ...attributes,
          ...pluginLeafProps,
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
