import React from 'react';

import { type Path, PathApi, TextApi } from '../../facade';
import {
  getCompiledPlateModelBinding,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import type { RenderLeafProps } from '../../lib';
import { getPluginNodeClass } from '../../lib';
import { type PlateNodeProps, PlateLeaf } from '../components/plate-nodes';
import type { Editor } from '../editor/Editor';
import { useEditorReadOnly } from '../plite-react';
import type { AnyResolvedPlatePlugin } from '../plugin/PlatePlugin';
import { getRenderNodeProps } from './getRenderNodeProps.internal';

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
  editor: Editor,
  plugin: AnyResolvedPlatePlugin,
  options: { assumeActive?: boolean } = {}
): RenderLeaf =>
  function RenderLeaf(props) {
    const readOnly = useEditorReadOnly();
    const { component: pluginComponent } = plugin;
    const { mark } = plugin.render;
    const component =
      mark?.leafComponent ??
      (mark?.placement === 'text' ? undefined : pluginComponent);
    const Component =
      component && typeof component !== 'string' ? component : undefined;
    const intrinsic = typeof component === 'string' ? component : undefined;
    const { children, leaf } = props;
    const leafKey = getCompiledPlateModelBinding(editor, plugin)?.propertyKey;

    if (isEditOnly(readOnly, plugin, 'render')) return children;
    if (!leafKey && !options.assumeActive) return children;

    if (options.assumeActive || (leafKey && leaf[leafKey])) {
      const canUseSimpleLeaf =
        !Component &&
        getPlateRuntime(editor).pluginCache.inject.nodeProps.text.length ===
          0 &&
        !plugin.render.attributes;

      if (canUseSimpleLeaf && !plugin.rules.selection?.affinity) {
        const Tag = intrinsic ?? 'span';
        const attributes = getSimpleLeafAttributes(
          props,
          getPluginNodeClass(plugin.name) || undefined
        );

        return <Tag {...attributes}>{children}</Tag>;
      }

      if (canUseSimpleLeaf && plugin.rules.selection?.affinity === 'hard') {
        const Tag = intrinsic ?? 'span';
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
      });

      const defaultProps = intrinsic ? { as: intrinsic } : {};

      return (
        <Leaf {...defaultProps} {...ctxProps}>
          {children}
        </Leaf>
      );
    }

    return children;
  };
