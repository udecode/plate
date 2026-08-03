import React from 'react';

import { useEditorReadOnly } from '@platejs/plite-react';

import type { AnyBasePlugin } from '../../lib';
import type { PlateEditor } from '../editor/PlateEditor';

import { getPluginNodeClass } from '../../lib';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import {
  getCompiledPlateModelBinding,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { type PlateTextProps, PlateText } from '../components/plate-nodes';
import { getRenderNodeProps } from './getRenderNodeProps';

export type RenderText = (props: PlateTextProps) => React.ReactElement<any>;

const getSimpleTextAttributes = (props: PlateTextProps, className?: string) => {
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
  editor: PlateEditor,
  plugin: AnyBasePlugin
): RenderText =>
  function render(nodeProps) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
        const Tag = (plugin.render?.as ??
          'span') as keyof HTMLElementTagNameMap;
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
      }) as any;

      const defaultProps = node ? {} : { as: plugin.render?.as };

      return (
        <Text {...defaultProps} {...ctxProps}>
          {children}
        </Text>
      );
    }

    return children;
  };
