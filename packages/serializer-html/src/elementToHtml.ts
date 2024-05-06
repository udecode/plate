import type React from 'react';

import { type PlateProps, pluginRenderElement } from '@udecode/plate-common';
import {
  type PlateEditor,
  type PlateRenderElementProps,
  type Value,
  pipeInjectProps,
} from '@udecode/plate-common/server';
import { decode } from 'html-entities';

import { createElementWithSlate } from './utils/createElementWithSlate';
import { renderToStaticMarkup } from './utils/renderToStaticMarkupClient';
import { stripClassNames } from './utils/stripClassNames';

export const elementToHtml = <V extends Value>(
  editor: PlateEditor<V>,
  {
    dndWrapper,
    plateProps,
    preserveClassNames,
    props,
  }: {
    dndWrapper?: React.ComponentClass | React.FC | string;
    plateProps?: Partial<PlateProps>;
    preserveClassNames?: string[];
    props: PlateRenderElementProps<V>;
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
