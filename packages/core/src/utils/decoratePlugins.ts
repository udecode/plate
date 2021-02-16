import { Editor, NodeEntry, Range } from 'slate';
import { Decorate } from '../types/Decorate';

/**
 * @see {@link Decorate}
 */
export const decoratePlugins = (
  editor: Editor,
  decorateList: (Decorate | undefined)[]
) => (entry: NodeEntry) => {
  let ranges: Range[] = [];

  const addRanges = (newRanges: ReturnType<Decorate>) => {
    if (newRanges?.length) ranges = [...ranges, ...newRanges];
  };

  decorateList.forEach((decorate) => {
    decorate && addRanges(decorate(entry, editor));
  });

  return ranges;
};
