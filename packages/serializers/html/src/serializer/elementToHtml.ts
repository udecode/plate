import { renderToStaticMarkup } from 'react-dom/server';
import { createElementWithSlate } from '@udecode/plate-common';
import {
  getRenderElement,
  pipeInjectProps,
  PlateEditor,
  PlateRenderElementProps,
  SlateProps,
} from '@udecode/plate-core';
import { stripClassNames } from './utils/stripClassNames';

export const elementToHtml = (
  editor: PlateEditor,
  {
    props,
    slateProps,
    preserveClassNames,
  }: {
    props: PlateRenderElementProps;
    slateProps?: Partial<SlateProps>;
    preserveClassNames?: string[];
  }
) => {
  // If no type provided we wrap children with div tag
  if (!props.element.type) {
    return `<div>${props.children}</div>`;
  }

  let html: string | undefined;

  props = pipeInjectProps<PlateRenderElementProps>(editor, props);

  // Search for matching plugin based on element type
  editor.plugins.some((plugin) => {
    if (!plugin.serialize?.element && !plugin.isElement) return false;

    if (
      !plugin
        .deserialize?.(editor, plugin)
        .element?.some((item) => item.type === String(props.element.type))
    ) {
      html = `<div>${props.children}</div>`;
      return false;
    }

    // Render element using picked plugins renderElement function and ReactDOM
    html = renderToStaticMarkup(
      createElementWithSlate({
        ...slateProps,
        children:
          plugin.serialize?.element?.(props) ??
          getRenderElement(editor, plugin)(props),
      })
    );

    html = stripClassNames(html, { preserveClassNames });

    return true;
  });

  return html;
};
