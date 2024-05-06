import { Path, Range } from 'slate';

/** Is the range in the same single text path. */
export const isRangeInSingleText = (at: Range) => {
  const [start, end] = Range.edges(at);

  return Path.equals(start.path, end.path);
};
