import type { AnyObject, Nullable } from '@udecode/utils';

import type { BasePlateEditor } from '../../../editor';
import type { HtmlDeserializer } from '../../../plugin/EditorPlugin';

import { pluginDeserializeHtml } from './pluginDeserializeHtml';

export const pipeDeserializeHtmlElement = (
  editor: BasePlateEditor,
  element: HTMLElement
) => {
  let result: (Nullable<HtmlDeserializer> & { node: AnyObject }) | undefined;

  [...editor.meta.pluginList].reverse().some((plugin) => {
    result = pluginDeserializeHtml(editor, plugin, { element });

    return !!result;
  });

  return result;
};
