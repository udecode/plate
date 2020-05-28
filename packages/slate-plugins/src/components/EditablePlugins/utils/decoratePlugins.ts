import { Decorate, SlatePlugin } from 'common/types';
import { NodeEntry, Range } from 'slate';

export const decoratePlugins = (
  plugins: SlatePlugin[],
  decorateList: Decorate[]
) => (entry: NodeEntry) => {
  let ranges: Range[] = [];

  const addRanges = (newRanges: Range[]) => {
    if (newRanges.length) ranges = [...ranges, ...newRanges];
  };

  decorateList.forEach((decorate) => {
    addRanges(decorate(entry));
  });

  plugins.forEach(({ decorate }) => {
    decorate && addRanges(decorate(entry));
  });

  return ranges;
};
