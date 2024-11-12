import React from 'react';

import type { TEditableProps } from '@udecode/slate-react';

import type { PlateEditor } from '../editor/PlateEditor';

import { DefaultLeaf } from '../components';
import { getRenderNodeProps } from './getRenderNodeProps';
import { type RenderLeaf, pluginRenderLeaf } from './pluginRenderLeaf';

/** @see {@link RenderLeaf} */
export const pipeRenderLeaf = (
  editor: PlateEditor,
  renderLeafProp?: TEditableProps['renderLeaf']
): TEditableProps['renderLeaf'] => {
  const renderLeafs: RenderLeaf[] = [];

  editor.pluginList.forEach((plugin) => {
    if (plugin.node.isLeaf && plugin.key) {
      renderLeafs.push(pluginRenderLeaf(editor, plugin));
    }
  });

  return function render(props) {
    renderLeafs.forEach((renderLeaf) => {
      const newChildren = renderLeaf(props as any);

      if (newChildren !== undefined) {
        props.children = newChildren;
      }
    });

    if (renderLeafProp) {
      return renderLeafProp(props);
    }

    const ctxProps = getRenderNodeProps({
      attributes: props.attributes as any,
      editor,
      props: props as any,
    }) as any;

    return <DefaultLeaf {...(ctxProps as any)} />;
  };
};
