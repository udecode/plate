import React from 'react';

import type { TText } from '@udecode/slate';
import type { TEditableProps, TRenderLeafProps } from '@udecode/slate-react';

import type { SlateEditor } from '../editor';
import type { SlatePlugin } from '../plugin';

import { DefaultStaticLeaf } from './PlateStatic';

export type RenderLeaf = (
  props: TRenderLeafProps
) => React.ReactElement | undefined;

export interface StaticLeafProps<T extends TText = TText> {
  as?: React.ElementType;
  attributes?: Record<string, any>;
  children?: React.ReactNode;
  leaf?: T;
}

export const pluginRenderStaticLeaf = (
  editor: SlateEditor,
  plugin: SlatePlugin
): RenderLeaf =>
  function render(nodeProps) {
    const {
      node: { staticComponent },
    } = plugin;
    const { children, leaf } = nodeProps;

    if (leaf[plugin.node.type ?? plugin.key]) {
      const Leaf = staticComponent ?? DefaultStaticLeaf;

      return (
        <Leaf attributes={nodeProps.attributes} leaf={leaf} text={leaf}>
          {children}
        </Leaf>
      );
    }

    return children;
  };

/** @see {@link RenderLeaf} */
export const pipeRenderStaticLeaf = (
  editor: SlateEditor,
  renderLeafProp?: TEditableProps['renderLeaf']
): TEditableProps['renderLeaf'] => {
  const renderLeafs: RenderLeaf[] = [];

  editor.pluginList.forEach((plugin) => {
    if (plugin.node.isLeaf && plugin.key) {
      renderLeafs.push(pluginRenderStaticLeaf(editor, plugin));
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

    return <DefaultStaticLeaf {...props} />;
  };
};
