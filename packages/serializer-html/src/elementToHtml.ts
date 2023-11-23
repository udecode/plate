import { ComponentClass, FunctionComponent } from 'react';
import {
  pipeInjectProps,
  PlateEditor,
  PlateProps,
  PlateRenderElementProps,
  pluginRenderElement,
  Value,
} from '@udecode/plate-common';
import { decode } from 'html-entities';
import { renderToStaticMarkup } from 'react-dom/server';

import { createElementWithSlate } from './utils/createElementWithSlate';
import { stripClassNames } from './utils/stripClassNames';

export const elementToHtml = <V extends Value>(
  editor: PlateEditor<V>,
  {
    props,
    plateProps,
    preserveClassNames,
    dndWrapper,
  }: {
    props: PlateRenderElementProps<V>;
    plateProps?: Partial<PlateProps>;
    preserveClassNames?: string[];
    dndWrapper?: string | FunctionComponent | ComponentClass;
  }
) => {
  let html = `<div>${props.children}</div>`;

  // If no type provided we wrap children with div tag
  if (!props.element.type) {
    return html;
  }

  props = pipeInjectProps<V>(editor, props);

  // Search for matching plugin based on element type
  editor.plugins.some((plugin) => {
    if (
      !plugin.isElement ||
      plugin.serializeHtml === null ||
      props.element.type !== plugin.type
    )
      return false;

    // Render element using picked plugins renderElement function and ReactDOM
    html = decode(
      renderToStaticMarkup(
        createElementWithSlate(
          {
            editor: editor as any,
            ...plateProps,
            children:
              plugin.serializeHtml?.(props as any) ??
              pluginRenderElement(editor, plugin)(props),
          },
          dndWrapper
        )
      )
    );

    html = stripClassNames(html, { preserveClassNames });

    return true;
  });

  return html;
};
