import { Editor, Location } from 'slate';
import { wrapNodes } from '../../../common/transforms/wrapNodes';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_LINK } from '../defaults';
import { LinkOptions } from '../types';

/**
 * Wrap selected nodes with a link and collapse at the end.
 */
export const wrapLink = (
  editor: Editor,
  url: string,
  options?: {
    at?: Location;
  } & LinkOptions
) => {
  const { at, link } = setDefaults(options, DEFAULTS_LINK);

  wrapNodes(
    editor,
    {
      type: link.type,
      url,
      children: [],
    },
    { at, split: true }
  );
};
