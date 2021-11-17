import { renderToStaticMarkup } from 'react-dom/server';
import {PlateEditor} from "../../types/PlateEditor";
import { PlateRenderLeafProps } from '../../types/PlateRenderLeafProps';
import { SlateProps } from '../../types/slate/SlateProps';
import {pipeInjectProps} from "../../utils/pipeInjectProps";
import { pluginRenderLeaf } from '../../utils/pluginRenderLeaf';
import {createElementWithSlate} from "./utils/createElementWithSlate";
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
