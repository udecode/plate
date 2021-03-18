import { Editor, NodeEntry, Range } from 'slate';
import { EditableProps } from 'slate-react/dist/components/editable';
import { Decorate } from '../types/SlatePlugin/Decorate';

/**
 * @see {@link Decorate}
 */
export const decoratePlugins = (
  editor: Editor,
  decorateList: (Decorate | undefined)[]
): EditableProps['decorate'] => (entry: NodeEntry) => {
  let ranges: Range[] = [];

  const addRanges = (newRanges?: Range[]) => {
    if (newRanges?.length) ranges = [...ranges, ...newRanges];
  };

  decorateList.forEach((decorate) => {
    decorate && addRanges(decorate(editor)(entry));
  });

  return ranges;
};
