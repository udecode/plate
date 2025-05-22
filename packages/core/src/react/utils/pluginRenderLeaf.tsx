import React from 'react';

import type { PlateEditor } from '../editor/PlateEditor';
import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';

import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import { type PlateLeafProps, PlateLeaf } from '../components/plate-nodes';
import { useReadOnly } from '../slate-react';
import { getRenderNodeProps } from './getRenderNodeProps';

export type RenderLeaf = (props: PlateLeafProps) => React.ReactElement<any>;

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
    const {
      render: { leaf: leafComponent, node },
    } = plugin;
    const { children, leaf } = props;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const readOnly = useReadOnly();

    if (isEditOnly(readOnly, plugin, 'render')) return children;

    if (leaf[plugin.node.type ?? plugin.key]) {
      const Leaf = leafComponent ?? node ?? PlateLeaf;

      const ctxProps = getRenderNodeProps({
        attributes: leaf.attributes as any,
        editor,
        plugin,
        props: props as any,
        readOnly,
      }) as any;

      return <Leaf {...ctxProps}>{children}</Leaf>;
    }

    return children;
  };
