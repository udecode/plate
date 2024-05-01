import type { Value } from '@udecode/slate';
import type { AnyObject } from '@udecode/utils';

import type { DeserializeHtml, PlateEditor } from '../../../types';
import type { Nullable } from '../../../types/misc/Nullable';

import { pluginDeserializeHtml } from './pluginDeserializeHtml';

export const pipeDeserializeHtmlElement = <V extends Value>(
  editor: PlateEditor<V>,
  element: HTMLElement
) => {
  let result: ({ node: AnyObject } & Nullable<DeserializeHtml>) | undefined;

  [...editor.plugins].reverse().some((plugin) => {
    result = pluginDeserializeHtml(editor, plugin, { element });

    return !!result;
  });

  return result;
};
