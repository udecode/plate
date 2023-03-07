import { renderToStaticMarkup } from 'react-dom/server';
import {
  pipeInjectProps,
  PlateEditor,
  PlateRenderLeafProps,
  pluginRenderLeaf,
  SlateProps,
  Value,
} from '@udecode/plate-common';
import { decode } from 'html-entities';
import { createElementWithSlate } from './utils/createElementWithSlate';
import { stripClassNames } from './utils/stripClassNames';

export const leafToHtml = <V extends Value>(
  editor: PlateEditor<V>,
  {
    props,
    slateProps,
    preserveClassNames,
  }: {
    props: PlateRenderLeafProps<V>;
    slateProps?: Partial<SlateProps>;
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
          ...slateProps,
          children: serialized,
        })
      )
    );

    html = stripClassNames(html, { preserveClassNames });

    return html;
  }, children);
};
