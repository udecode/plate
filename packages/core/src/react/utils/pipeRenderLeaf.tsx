import React from 'react';

import clsx from 'clsx';

import type { EditableProps } from '../../lib';
import type { PlateEditor } from '../editor/PlateEditor';
import type { AnyEditorPlatePlugin } from '../plugin';

import { PlateLeaf } from '../components';
import { getRenderNodeProps } from './getRenderNodeProps';
import { type RenderLeaf, pluginRenderLeaf } from './pluginRenderLeaf';

/** @see {@link RenderLeaf} */
export const pipeRenderLeaf = (
  editor: PlateEditor,
  renderLeafProp?: EditableProps['renderLeaf']
): EditableProps['renderLeaf'] => {
  const renderLeafs: RenderLeaf[] = [];
  const leafPropsPlugins: AnyEditorPlatePlugin[] = [];

  editor.pluginList.forEach((plugin) => {
    if (
      plugin.node.isLeaf &&
      (plugin.node.isDecoration === true || plugin.render.leaf)
    ) {
      renderLeafs.push(pluginRenderLeaf(editor, plugin));
    }

    if (plugin.node.leafProps) {
      leafPropsPlugins.push(plugin);
    }
  });

  return function render({ attributes, ...props }) {
    renderLeafs.forEach((renderLeaf) => {
      const newChildren = renderLeaf(props as any);

      if (newChildren !== undefined) {
        props.children = newChildren;
      }
    });

    leafPropsPlugins.forEach((plugin) => {
      if (props.leaf[plugin.node.type ?? plugin.key]) {
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

    if (renderLeafProp) {
      return renderLeafProp({ attributes, ...props } as any);
    }

    const ctxProps = getRenderNodeProps({
      editor,
      props: { attributes, ...props } as any,
    }) as any;

    return <PlateLeaf {...ctxProps}>{props.children}</PlateLeaf>;
  };
};
