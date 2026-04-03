import React from 'react';

import { NodeApi } from '@platejs/slate';

import type { PlateEditor } from '../editor/PlateEditor';
import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';

import { getSlateClass } from '../../lib';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import { type PlateLeafProps, PlateLeaf } from '../components/plate-nodes';
import { useReadOnly } from '../slate-react';
import { getRenderNodeProps } from './getRenderNodeProps';

export type RenderLeaf = (props: PlateLeafProps) => React.ReactElement<any>;

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

/**
 * Get a `Editable.renderLeaf` handler for `plugin.node.type`. If the type is
 * equals to the slate leaf type, render `plugin.render.node`. Else, return
 * `children`.
 */
export const pluginRenderLeaf = (
  editor: PlateEditor,
  plugin: AnyEditorPlatePlugin
): RenderLeaf =>
  function render(props) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const readOnly = useReadOnly();
    const {
      render: { leaf: leafComponent, node },
    } = plugin;
    const { children, leaf, text } = props;
    const Component = leafComponent ?? node;

    if (isEditOnly(readOnly, plugin, 'render')) return children;

    if (leaf[plugin.node.type]) {
      const canUseSimpleLeaf =
        !Component &&
        editor.meta.pluginCache.inject.nodeProps.length === 0 &&
        !plugin.node.props &&
        !plugin.node.dangerouslyAllowAttributes?.length;

      if (canUseSimpleLeaf && !plugin.rules.selection?.affinity) {
        const Tag = (plugin.render?.as ??
          'span') as keyof HTMLElementTagNameMap;

        return (
          <Tag className={getSlateClass(plugin.node.type) || undefined}>
            {children}
          </Tag>
        );
      }

      if (canUseSimpleLeaf && plugin.rules.selection?.affinity === 'hard') {
        const Tag = (plugin.render?.as ??
          'span') as keyof HTMLElementTagNameMap;
        const showBoundarySpacers = isActiveHardAffinityBoundary(editor, text);

        if (!showBoundarySpacers) {
          return (
            <Tag className={getSlateClass(plugin.node.type) || undefined}>
              {children}
            </Tag>
          );
        }

        return (
          <>
            <span contentEditable={false} style={HARD_AFFINITY_SPACER_STYLE}>
              {HARD_AFFINITY_SPACE}
            </span>
            <Tag className={getSlateClass(plugin.node.type) || undefined}>
              {children}
              <span contentEditable={false} style={HARD_AFFINITY_SPACER_STYLE}>
                {HARD_AFFINITY_SPACE}
              </span>
            </Tag>
          </>
        );
      }

      const Leaf = Component ?? PlateLeaf;

      const ctxProps = getRenderNodeProps({
        attributes: leaf.attributes as any,
        editor,
        plugin,
        props: props as any,
        readOnly,
      }) as any;

      const defaultProps = Component ? {} : { as: plugin.render?.as };

      return (
        <Leaf {...defaultProps} {...ctxProps}>
          {children}
        </Leaf>
      );
    }

    return children;
  };
