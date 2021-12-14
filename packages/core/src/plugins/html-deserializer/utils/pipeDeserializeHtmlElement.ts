import { PlateEditor } from '../../../types/PlateEditor';
import { DeserializeHtml } from '../../../types/plugins/DeserializeHtml';
import { AnyObject } from '../../../types/utility/AnyObject';
import { Nullable } from '../../../types/utility/Nullable';
import { pluginDeserializeHtml } from './pluginDeserializeHtml';

export const pipeDeserializeHtmlElement = <T = {}>(
  editor: PlateEditor<T>,
  element: HTMLElement
) => {
  let result: (Nullable<DeserializeHtml> & { node: AnyObject }) | undefined;

  [...editor.plugins].reverse().some((plugin) => {
    result = pluginDeserializeHtml(editor, plugin, { element });

    return !!result;
  });

  return result;
};
