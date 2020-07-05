import { Editor, Location, Transforms } from 'slate';
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
  Transforms.wrapNodes(
    editor,
    {
      type: typeLink,
      url,
      children: [],
    },
    { at, split: true }
  );
};
