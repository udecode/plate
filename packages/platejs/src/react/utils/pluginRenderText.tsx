import { useEditorReadOnly } from 'plitejs/react';
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
import { getRenderNodeProps } from './getRenderNodeProps';

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
    const {
      render: { node },
    } = plugin;
    const { children, text } = nodeProps;
    const textKey = getCompiledPlateModelBinding(editor, plugin)?.propertyKey;

    if (isEditOnly(readOnly, plugin, 'render')) return children;
    if (!textKey) return children;

    if (text[textKey]) {
      const canUsePlainText =
        !node &&
        getPlateRuntime(editor).pluginCache.inject.nodeProps.length === 0 &&
        !plugin.render.nodeProps;

      if (canUsePlainText) {
        const Tag = plugin.render?.as ?? 'span';
        const attributes = getSimpleTextAttributes(
          nodeProps,
          getPluginNodeClass(plugin.name) || undefined
        );

        return <Tag {...attributes}>{children}</Tag>;
      }

      const Text = node ?? PlateText;

      const ctxProps = getRenderNodeProps({
        editor,
        plugin,
        props: nodeProps as any,
        readOnly,
      });

      const defaultProps = node ? {} : { as: plugin.render?.as };

      return (
        <Text {...defaultProps} {...ctxProps}>
          {children}
        </Text>
      );
    }

    return children;
  };
