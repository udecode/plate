import React from 'react';

import {
  getCompiledPlateModelBinding,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import type { AnyBasePlugin, RenderTextProps } from '../../lib';
import { getPluginNodeClass } from '../../lib';
import { type PlateNodeProps, PlateText } from '../components/plate-nodes';
import type { Editor } from '../editor/Editor';
import { useEditorReadOnly } from '../plite-react';
import { getRenderNodeProps } from './getRenderNodeProps.internal';

type PlateTextRenderProps = PlateNodeProps & RenderTextProps;

export type RenderText = (
  props: PlateTextRenderProps
) => React.ReactElement<any>;

const getSimpleTextAttributes = (
  props: PlateTextRenderProps,
  className?: string
) => {
  const attributes = (props.attributes ?? {}) as any;

  return {
    ...attributes,
    className:
      [className, attributes.className].filter(Boolean).join(' ') || undefined,
  };
};

/**
 * Get an `Editable.renderText` handler for one plugin-owned property key.
 */
export const pluginRenderText = (
  editor: Editor,
  plugin: AnyBasePlugin
): RenderText =>
  function RenderText(nodeProps) {
    const readOnly = useEditorReadOnly();
    const component =
      plugin.render.mark?.placement === 'text' ? plugin.component : undefined;
    const Component =
      component && typeof component !== 'string' ? component : undefined;
    const intrinsic = typeof component === 'string' ? component : undefined;
    const { children, text } = nodeProps;
    const textKey = getCompiledPlateModelBinding(editor, plugin)?.propertyKey;

    if (isEditOnly(readOnly, plugin, 'render')) return children;
    if (!textKey) return children;

    if (text[textKey]) {
      const canUsePlainText =
        !Component &&
        getPlateRuntime(editor).pluginCache.inject.nodeProps.text.length ===
          0 &&
        !plugin.render.attributes;

      if (canUsePlainText) {
        const Tag = intrinsic ?? 'span';
        const attributes = getSimpleTextAttributes(
          nodeProps,
          getPluginNodeClass(plugin.name) || undefined
        );

        return <Tag {...attributes}>{children}</Tag>;
      }

      const Text = Component ?? PlateText;

      const ctxProps = getRenderNodeProps({
        editor,
        plugin,
        props: nodeProps as any,
        readOnly,
      });

      const defaultProps = intrinsic ? { as: intrinsic } : {};

      return (
        <Text {...defaultProps} {...ctxProps}>
          {children}
        </Text>
      );
    }

    return children;
  };
