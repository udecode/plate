import { Editor, Location } from 'slate';
import { wrapNodes } from '../../../common/transforms/wrapNodes';
import { LINK } from '../types';

/**
 * Wrap selected nodes with a link and collapse at the end.
 */
export const wrapLink = (
  editor: Editor,
  url: string,
  {
    typeLink = LINK,
    at,
  }: {
    typeLink?: string;
    at?: Location;
  } = {}
) => {
  wrapNodes(
    editor,
    {
      type: typeLink,
      url,
      children: [],
    },
    { at, split: true }
  );
};
