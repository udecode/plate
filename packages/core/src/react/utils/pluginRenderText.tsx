import React from 'react';

import { useEditorReadOnly } from '@platejs/plite-react';

import type { AnyBasePlugin } from '../../lib';
import type { PlateEditor } from '../editor/PlateEditor';

import { getPluginNodeClass } from '../../lib';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
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
 * Get a `Editable.renderText` handler for `plugin.node.type`. If the type is
 * equals to the plite text type and isDecoration is false, render
 * `plugin.render.node`. Else, return the default text rendering.
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
    const textKey = plugin.node.type ?? plugin.key;

    if (isEditOnly(readOnly, plugin, 'render')) return children;

    if (text[textKey]) {
      const canUsePlainText =
        !node &&
        editor.runtime.pluginCache.inject.nodeProps.length === 0 &&
        !plugin.node.props &&
        !plugin.node.dangerouslyAllowAttributes?.length;

      if (canUsePlainText) {
        const Tag = (plugin.render?.as ??
          'span') as keyof HTMLElementTagNameMap;
        const attributes = getSimpleTextAttributes(
          nodeProps,
          getPluginNodeClass(plugin.node.type) || undefined
        );

        return <Tag {...attributes}>{children}</Tag>;
      }

      const Text = node ?? PlateText;

      const ctxProps = getRenderNodeProps({
        attributes: nodeProps.attributes,
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
