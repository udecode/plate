import {
  AnyObject,
  DeserializeHtml,
  Nullable,
  PlateEditor,
} from '@udecode/plate-core';
import { pluginDeserializeHtml } from './pluginDeserializeHtml';

export const pipeDeserializeHtmlElement = <T = {}>(
  editor: PlateEditor<T>,
  element: HTMLElement
) => {
  let result: (Nullable<DeserializeHtml> & { node: AnyObject }) | undefined;

  editor.plugins.reverse().some((plugin) => {
    result = pluginDeserializeHtml(plugin, element);

    if (result) return true;
  });

  return result;
};
