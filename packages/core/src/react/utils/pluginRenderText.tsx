import React from 'react';

import type { PlateEditor } from '../editor/PlateEditor';
import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';

import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import { type PlateTextProps, PlateText } from '../components/plate-nodes';
import { useReadOnly } from '../slate-react';
import { getRenderNodeProps } from './getRenderNodeProps';

export type RenderText = (props: PlateTextProps) => React.ReactElement<any>;

/**
 * Get a `Editable.renderText` handler for `plugin.node.type`. If the type is
 * equals to the slate text type and isDecoration is false, render
 * `plugin.render.node`. Else, return the default text rendering.
 */
export const pluginRenderText = (
  editor: PlateEditor,
  plugin: AnyEditorPlatePlugin
): RenderText =>
  function render(nodeProps) {
    const {
      render: { node },
    } = plugin;
    const { children, text } = nodeProps;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const readOnly = useReadOnly();

    if (isEditOnly(readOnly, plugin, 'render')) return children;

    if (text[plugin.node.type ?? plugin.key]) {
      const Text = node ?? PlateText;

      const ctxProps = getRenderNodeProps({
        attributes: nodeProps.attributes,
        editor,
        plugin,
        props: nodeProps as any,
        readOnly,
      }) as any;

      return (
        <Text as={node ? undefined : plugin.render.as} {...ctxProps}>
          {children}
        </Text>
      );
    }

    return children;
  };
