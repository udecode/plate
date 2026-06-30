import type { AnyObject, Nullable } from '@udecode/utils';

import type { BaseEditor } from '../../../editor';
import type { HtmlDeserializer } from '../../../plugin/BasePlugin';

import { pluginDeserializeHtml } from './pluginDeserializeHtml';

export const pipeDeserializeHtmlElement = (
  editor: BaseEditor,
  element: HTMLElement
) => {
  let result: (Nullable<HtmlDeserializer> & { node: AnyObject }) | undefined;

  [...editor.runtime.pluginList].reverse().some((plugin) => {
    result = pluginDeserializeHtml(editor, plugin, { element });

    return !!result;
  });

  return result;
};
