import {
  pipeInjectProps,
  PlateEditor,
  PlateProps,
  PlateRenderLeafProps,
  pluginRenderLeaf,
  Value,
} from '@udecode/plate-common';
import { decode } from 'html-entities';

import { createElementWithSlate } from './utils/createElementWithSlate';
import { renderToStaticMarkup } from './utils/renderToStaticMarkupClient';
import { stripClassNames } from './utils/stripClassNames';

export const leafToHtml = <V extends Value>(
  editor: PlateEditor<V>,
  {
    props,
    plateProps,
    preserveClassNames,
  }: {
    props: PlateRenderLeafProps<V>;
    plateProps?: Partial<PlateProps>;
    preserveClassNames?: string[];
  }
) => {
  const { children } = props;

  return editor.plugins.reduce((result, plugin) => {
    if (!plugin.isLeaf) return result;

    props = {
      ...pipeInjectProps<V>(editor, props),
      children: result,
    };

    const serialized =
      plugin.serializeHtml?.(props as any) ??
      pluginRenderLeaf(editor, plugin)(props);

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
