import React from 'react';

import type { PlateEditor } from '../editor/PlateEditor';
import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';
import type { PlateRenderTextProps } from '../plugin/PlateRenderTextProps';

import { DefaultText } from '../components/DefaultText';
import { getRenderNodeProps } from './getRenderNodeProps';

export type RenderText = (
  props: PlateRenderTextProps
) => React.ReactElement<any>;

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

    if (text[plugin.node.type ?? plugin.key]) {
      const Text = node ?? DefaultText;

      const ctxProps = getRenderNodeProps({
        attributes: nodeProps.attributes,
        editor,
        plugin,
        props: nodeProps as any,
      }) as any;

      return <Text {...ctxProps}>{children}</Text>;
    }

    return children;
  };
