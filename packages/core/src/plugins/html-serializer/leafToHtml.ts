import { renderToStaticMarkup } from 'react-dom/server';
import { Value } from '../../slate/editor/TEditor';
import { SlateProps } from '../../slate/types/SlateProps';
import { PlateEditor } from '../../types/PlateEditor';
import { PlateRenderLeafProps } from '../../types/PlateRenderLeafProps';
import { pipeInjectProps } from '../../utils/pipeInjectProps';
import { pluginRenderLeaf } from '../../utils/pluginRenderLeaf';
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
      children: encodeURIComponent(result),
    };

    const serialized =
      plugin.serializeHtml?.(props as any) ??
      pluginRenderLeaf(editor, plugin)(props);

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
