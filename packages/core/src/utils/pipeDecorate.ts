import { NodeEntry, Range } from 'slate';
import { EditableProps } from 'slate-react/dist/components/editable';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { SPEditor } from '../types/SPEditor';
import { flatMapByKey } from './flatMapByKey';

/**
 * @see {@link Decorate}
 */
export const pipeDecorate = (
  editor: SPEditor,
  plugins: SlatePlugin[]
): EditableProps['decorate'] => (entry: NodeEntry) => {
  let ranges: Range[] = [];

  const addRanges = (newRanges?: Range[]) => {
    if (newRanges?.length) ranges = [...ranges, ...newRanges];
  };

  flatMapByKey(plugins, 'decorate').forEach((decorate) => {
    addRanges(decorate(editor)(entry));
  });

  return ranges;
};
