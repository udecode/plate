import { renderToStaticMarkup } from 'react-dom/server';
import { createElementWithSlate } from '@udecode/plate-common';
import {
  pipeInjectProps,
  PlateEditor,
  PlateRenderLeafProps,
  pluginRenderLeaf,
  SlateProps,
} from '@udecode/plate-core';
import { stripClassNames } from './utils/stripClassNames';

export const leafToHtml = (
  editor: PlateEditor,
  {
    props,
    slateProps,
    preserveClassNames,
  }: {
    props: PlateRenderLeafProps;
    slateProps?: Partial<SlateProps>;
    preserveClassNames?: string[];
  }
) => {
  const { children } = props;

  return editor.plugins.reduce((result, plugin) => {
    if (!plugin.isLeaf) return result;

    props = {
      ...pipeInjectProps<PlateRenderLeafProps>(editor, props),
      children: encodeURIComponent(result),
    };

    const serialized =
      plugin.serializeHtml?.(props) ?? pluginRenderLeaf(editor, plugin)(props);

    if (serialized === children) return result;

    let html = decodeURIComponent(
      renderToStaticMarkup(
        createElementWithSlate({
          ...slateProps,
          children: serialized,
        })
      )
    );

    html = stripClassNames(html, { preserveClassNames });

    return html;
  }, children);
};
