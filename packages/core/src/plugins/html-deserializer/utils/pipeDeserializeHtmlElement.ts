import { Value } from '../../../../../slate-utils/src/slate/editor/TEditor';
import { AnyObject } from '../../../../../slate-utils/src/types/misc/AnyObject';
import { Nullable } from '../../../../../slate-utils/src/types/misc/Nullable';
import { PlateEditor } from '../../../types/plate/PlateEditor';
import { DeserializeHtml } from '../../../types/plugin/DeserializeHtml';
import { pluginDeserializeHtml } from './pluginDeserializeHtml';

export const pipeDeserializeHtmlElement = <V extends Value>(
  editor: PlateEditor<V>,
  element: HTMLElement
) => {
  let result: (Nullable<DeserializeHtml> & { node: AnyObject }) | undefined;

  [...editor.plugins].reverse().some((plugin) => {
    result = pluginDeserializeHtml(editor, plugin, { element });

    return !!result;
  });

  return result;
};
