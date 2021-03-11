import { wrapNodes } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor, Location } from 'slate';

/**
 * Wrap selected nodes with a link and collapse at the end.
 */
export const wrapLink = (
  editor: Editor,
  { at, url }: { url: string; at?: Location },
  options: SlatePluginsOptions
) => {
  const { a } = options;

  wrapNodes(
    editor,
    {
      type: a.type,
      url,
      children: [],
    },
    { at, split: true }
  );
};
