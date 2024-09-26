import type { TRenderLeafProps } from '@udecode/slate-react';

import { getEditorPlugin, pipeInjectNodeProps } from '@udecode/plate-common';
import {
  type PlateEditor,
  type PlateProps,
  pluginRenderLeaf,
} from '@udecode/plate-common/react';
import { decode } from 'html-entities';

import { stripClassNames } from '../lib';
import { createElementWithSlate } from './utils/createElementWithSlate';
import { renderToStaticMarkup } from './utils/renderToStaticMarkupClient';

export const leafToHtml = (
  editor: PlateEditor,
  {
    plateProps,
    preserveClassNames,
    props,
  }: {
    props: TRenderLeafProps;
    plateProps?: Partial<PlateProps>;
    preserveClassNames?: string[];
  }
) => {
  const { children } = props;

  return editor.pluginList.reduce((result, plugin) => {
    if (!plugin.node.isLeaf) return result;

    props = {
      ...pipeInjectNodeProps(editor, props),
      children: result,
      ...getEditorPlugin(editor, plugin),
    };

    const serializer = plugin.parsers.htmlReact?.serializer;

    if (
      serializer === null ||
      (serializer?.query && !serializer.query(props as any))
    ) {
      return result;
    }

    const serialized =
      serializer?.parse?.(props as any) ??
      pluginRenderLeaf(editor, plugin)(props as any);

    if (serialized === children) return result;

    let html = decode(
      renderToStaticMarkup(
        createElementWithSlate({
          ...plateProps,
          children: serialized,
        })
      )
    );

    html = stripClassNames(html, { preserveClassNames });

    return html;
  }, children);
};
