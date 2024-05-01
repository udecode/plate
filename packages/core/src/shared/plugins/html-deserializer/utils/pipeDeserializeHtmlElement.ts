import { Value } from '@udecode/slate';
import { AnyObject } from '@udecode/utils';

import { DeserializeHtml, PlateEditor } from '../../../types';
import { Nullable } from '../../../types/misc/Nullable';
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
