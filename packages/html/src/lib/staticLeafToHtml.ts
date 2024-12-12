import {
  type SlateEditor,
  type SlatePlugin,
  PlateStaticLeaf,
  createStaticString,
  getRenderStaticNodeProps,
} from '@udecode/plate-common';

import { renderComponentToHtml } from './utils/renderComponentToHtml';

export const staticLeafToHtml = (
  editor: SlateEditor,
  {
    ReactDOMServer,
    components,
    props,
  }: { ReactDOMServer: any; components: any; props: any }
): string => {
  const innerString = editor.pluginList.reduce(
    (result: string, plugin: SlatePlugin) => {
      if (!plugin.node.isLeaf) return result;
      if (props.leaf[plugin.key]) {
        const Component = components[plugin.key];

        if (!Component) return result;

        const ctxProps = getRenderStaticNodeProps({
          editor,
          plugin,
          props: props,
        });

        return renderComponentToHtml(ReactDOMServer, Component, {
          ...ctxProps,
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

  const ctxProps = getRenderStaticNodeProps({
    editor,
    props,
  }) as any;

  return renderComponentToHtml(ReactDOMServer, PlateStaticLeaf, {
    ...ctxProps,
    children: innerString,
  });
};
