import { NodeEntry, Range } from 'slate';
import { EditableProps } from 'slate-react/dist/components/editable';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { SPEditor } from '../types/SPEditor';
import { flatMapKey } from './flatMapKey';

/**
 * @see {@link Decorate}
 */
export const decoratePlugins = (
  editor: SPEditor,
  plugins: SlatePlugin[]
): EditableProps['decorate'] => (entry: NodeEntry) => {
  let ranges: Range[] = [];

  const addRanges = (newRanges?: Range[]) => {
    if (newRanges?.length) ranges = [...ranges, ...newRanges];
  };

  flatMapKey(plugins, 'decorate').forEach((decorate) => {
    addRanges(decorate(editor)(entry));
  });

  return ranges;
};
