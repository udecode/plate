import type { TElement } from '@udecode/slate';

import type { SlateEditor } from '../editor';
import type { ToggleBlockOptions } from '../plugins/getCorePlugins';

import { BaseParagraphPlugin } from '../plugins';

export const toggleBlock = (
  editor: SlateEditor,
  type: string,
  {
    defaultType = editor.getType(BaseParagraphPlugin),
    someOptions,
    wrap,
    ...options
  }: ToggleBlockOptions = {}
) => {
  const at = options.at ?? editor.selection;

  if (!at) return;

  const isActive = editor.api.some({
    at,
    ...someOptions,
    match: { type },
  });

  if (wrap) {
    if (isActive) {
      editor.tf.unwrapNodes({ at, match: { type } });
    } else {
      editor.tf.wrapNodes({ children: [], type }, { at });
    }

    return;
  }
  if (isActive && type === defaultType) return;

  editor.getTransforms().setNodes<TElement>(
    {
      type: isActive ? defaultType : type,
    },
    { at: at as any, ...options }
  );
};
