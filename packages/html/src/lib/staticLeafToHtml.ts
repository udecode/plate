import {
  type SlateEditor,
  type SlatePlugin,
  DefaultStaticLeaf,
  createStaticString,
} from '@udecode/plate-common';

import { renderComponentToHtml } from './utils/renderComponentToHtml';

export const staticLeafToHtml = (
  editor: SlateEditor,
  { ReactDOMServer, props }: { ReactDOMServer: any; props: any }
): string => {
  const innerString = editor.pluginList.reduce(
    (result: string, plugin: SlatePlugin) => {
      if (!plugin.node.isLeaf) return result;
      if (props.leaf[plugin.key]) {
        const Component = plugin.node.staticComponent!;

        if (!Component) return result;

        return renderComponentToHtml(ReactDOMServer, Component, {
          ...props,
          children: result,
        });
      }

      return result;
    },
    renderComponentToHtml(ReactDOMServer, createStaticString, {
      ...props,
      text: props.children,
    })
  );

  return renderComponentToHtml(ReactDOMServer, DefaultStaticLeaf, {
    ...props,
    children: innerString,
  });
};
