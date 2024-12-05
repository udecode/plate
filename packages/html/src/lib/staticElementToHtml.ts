import type { TRenderElementProps } from '@udecode/plate-common/react';

import {
  type SlateEditor,
  type SlatePlugin,
  DefaultStaticElement,
} from '@udecode/plate-common';

import { renderComponentToHtml } from './utils/renderComponentToHtml';

export const staticElementToHtml = (
  editor: SlateEditor,
  {
    ReactDOMServer,
    props,
  }: {
    ReactDOMServer: any;
    props: TRenderElementProps;
    preserveClassNames?: string[];
  }
): string => {
  if (!props.element.type) {
    return renderComponentToHtml(ReactDOMServer, DefaultStaticElement, props);
  }

  let html;

  editor.pluginList.some((plugin: SlatePlugin) => {
    if (
      !plugin.node.staticComponent ||
      props.element.type !== plugin.node.type
    ) {
      return false;
    }

    const Component = plugin.node.staticComponent;

    html = renderComponentToHtml(ReactDOMServer, Component, props);

    return true;
  });

  return (
    html ?? renderComponentToHtml(ReactDOMServer, DefaultStaticElement, props)
  );
};
