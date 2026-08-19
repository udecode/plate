import React from 'react';

import { type Path, PathApi, TextApi } from '@platejs/plite';
import { useEditorReadOnly } from '@platejs/plite-react';

import type { PlateEditor } from '../editor/PlateEditor';
import type { AnyResolvedPlatePlugin } from '../plugin/PlatePlugin';

import type { RenderLeafProps } from '../../lib';
import { getPluginNodeClass } from '../../lib';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import {
  getCompiledPlateModelBinding,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { type PlateNodeProps, PlateLeaf } from '../components/plate-nodes';
import { getRenderNodeProps } from './getRenderNodeProps';

type PlateLeafRenderProps = PlateNodeProps & RenderLeafProps;

export type RenderLeaf = (
  props: PlateLeafRenderProps
) => React.ReactElement<any>;

const HARD_AFFINITY_SPACE = String.fromCodePoint(160);
const HARD_AFFINITY_SPACER_STYLE = {
  fontSize: 0,
  lineHeight: 0,
} as const;

const isActiveHardAffinityBoundary = (
  editor: PlateEditor,
  path: Path | undefined
) => {
  if (!path) return false;
  const match = editor.read((state) => {
    if (!state.selection.isCollapsed()) return;

    const focus = state.selection()?.focus;

    if (!focus) return;

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

const getSimpleLeafAttributes = (
  props: PlateLeafRenderProps,
  className?: string
) => {
  const attributes = props.attributes ?? {};

  return {
    ...attributes,
    className:
      [className, attributes.className].filter(Boolean).join(' ') || undefined,
  };
};

/**
 * Get an `Editable.renderLeaf` handler for one plugin-owned property key.
 */
export const pluginRenderLeaf = (
  editor: PlateEditor,
  plugin: AnyResolvedPlatePlugin
): RenderLeaf =>
  function render(props) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const readOnly = useEditorReadOnly();
    const {
      render: { leaf: leafComponent, node },
    } = plugin;
    const { children, leaf } = props;
    const Component = leafComponent ?? node;
    const leafKey = getCompiledPlateModelBinding(editor, plugin)?.propertyKey;

    if (isEditOnly(readOnly, plugin, 'render')) return children;
    if (!leafKey) return children;

    if (leaf[leafKey]) {
      const canUseSimpleLeaf =
        !Component &&
        getPlateRuntime(editor).pluginCache.inject.nodeProps.length === 0 &&
        !plugin.render.nodeProps;

      if (canUseSimpleLeaf && !plugin.rules.selection?.affinity) {
        const Tag = (plugin.render?.as ??
          'span') as keyof HTMLElementTagNameMap;
        const attributes = getSimpleLeafAttributes(
          props,
          getPluginNodeClass(plugin.name) || undefined
        );

        return <Tag {...attributes}>{children}</Tag>;
      }

      if (canUseSimpleLeaf && plugin.rules.selection?.affinity === 'hard') {
        const Tag = (plugin.render?.as ??
          'span') as keyof HTMLElementTagNameMap;
        const attributes = getSimpleLeafAttributes(
          props,
          getPluginNodeClass(plugin.name) || undefined
        );
        const showBoundarySpacers = isActiveHardAffinityBoundary(
          editor,
          props.path
        );

        if (!showBoundarySpacers) {
          return <Tag {...attributes}>{children}</Tag>;
        }

        return (
          <>
            <span contentEditable={false} style={HARD_AFFINITY_SPACER_STYLE}>
              {HARD_AFFINITY_SPACE}
            </span>
            <Tag {...attributes}>
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
