import type React from 'react';

import type { TRenderElementProps } from '@udecode/slate-react';

import { getEditorPlugin, pipeInjectNodeProps } from '@udecode/plate-common';
import {
  type PlateEditor,
  type PlateProps,
  pluginRenderElement,
} from '@udecode/plate-common/react';
import { decode } from 'html-entities';

import { stripClassNames } from '../lib/stripClassNames';
import { createElementWithSlate } from './utils/createElementWithSlate';
import { renderToStaticMarkup } from './utils/renderToStaticMarkupClient';

export const elementToHtml = (
  editor: PlateEditor,
  {
    dndWrapper,
    plateProps,
    preserveClassNames,
    props,
  }: {
    props: TRenderElementProps;
    dndWrapper?: React.ComponentClass | React.FC | string;
    plateProps?: Partial<PlateProps>;
    preserveClassNames?: string[];
  }
) => {
  let html = `<div>${props.children}</div>`;

  // If no type provided we wrap children with div tag
  if (!props.element.type) {
    return html;
  }

  props = pipeInjectNodeProps(editor, props);

  // Search for matching plugin based on element type
  editor.pluginList.some((plugin) => {
    const serializer = plugin.parsers.htmlReact?.serializer;

    if (
      !plugin.node.isElement ||
      serializer === null ||
      (serializer?.query && !serializer.query(props as any)) ||
      props.element.type !== plugin.node.type
    ) {
      return false;
    }

    // Render element using picked plugins renderElement function and ReactDOM
    html = decode(
      renderToStaticMarkup(
        createElementWithSlate(
          {
            ...plateProps,
            children:
              serializer?.parse?.({
                ...props,
                ...getEditorPlugin(editor, plugin),
              } as any) ??
              pluginRenderElement(editor, plugin)({ ...props } as any),
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
