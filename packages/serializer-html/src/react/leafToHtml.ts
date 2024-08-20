import type { TRenderLeafProps } from '@udecode/slate-react';

import { getPluginContext, pipeInjectProps } from '@udecode/plate-common';
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
    plateProps?: Partial<PlateProps>;
    preserveClassNames?: string[];
    props: TRenderLeafProps;
  }
) => {
  const { children } = props;

  return editor.pluginList.reduce((result, plugin) => {
    if (!plugin.isLeaf) return result;

    props = {
      ...pipeInjectProps(editor, props),
      children: result,
      ...getPluginContext(editor, plugin),
    };

    const serialized =
      plugin.serializeHtml?.(props as any) ??
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
