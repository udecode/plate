import { renderToStaticMarkup } from 'react-dom/server';
import { createElementWithSlate } from '@udecode/plate-common';
import {
  getRenderLeaf,
  pipeInjectProps,
  PlateEditor,
  PlateRenderLeafProps,
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
    if (!plugin.serialize?.leaf && !plugin.isLeaf) return result;
    if (
      (plugin.serialize?.leaf?.(props) ??
        getRenderLeaf(editor, plugin)(props)) === children
    )
      return result;

    props = {
      ...pipeInjectProps<PlateRenderLeafProps>(editor, props),
      children: encodeURIComponent(result),
    };

    let html = decodeURIComponent(
      renderToStaticMarkup(
        createElementWithSlate({
          ...slateProps,
          children:
            plugin.serialize?.leaf?.(props) ??
            getRenderLeaf(editor, plugin)(props),
        })
      )
    );

    html = stripClassNames(html, { preserveClassNames });

    return html;
  }, children);
};
