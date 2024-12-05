import type { TRenderLeafProps } from '@udecode/plate-common/react';

import {
  type SlateEditor,
  type SlatePlugin,
  DefaultStaticLeaf,
  createStaticString,
} from '@udecode/plate-common';

import { renderComponentToHtml } from './utils/renderComponentToHtml';

export const staticLeafToHtml = (
  editor: SlateEditor,
  { ReactDOMServer, props }: { ReactDOMServer: any; props: TRenderLeafProps }
): string => {
  let html;

  editor.pluginList.some((plugin: SlatePlugin) => {
    if (!plugin.node.isLeaf) return false;
    if (props.leaf[plugin.key]) {
      const Component = plugin.node.staticComponent!;

      if (!Component) return false;

      html = renderComponentToHtml(ReactDOMServer, Component, {
        ...props,
        children: createStaticString({ text: props.leaf.text }),
      });

      return true;
    }

    return false;
  });

  return (
    html ??
    renderComponentToHtml(ReactDOMServer, DefaultStaticLeaf, {
      ...props,
      children: createStaticString({ text: props.leaf.text }),
    })
  );
};
