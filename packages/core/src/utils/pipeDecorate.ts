import { NodeEntry, Range } from 'slate';
import { EditableProps } from 'slate-react/dist/components/editable';
import { PlateEditor } from '../types/PlateEditor';

/**
 * @see {@link Decorate}.
 * Optimization: return undefined if empty list so Editable uses a memo.
 */
export const pipeDecorate = (
  editor: PlateEditor,
  decorateProp?: EditableProps['decorate']
): EditableProps['decorate'] => {
  const decorates = editor.plugins.flatMap(
    (plugin) => plugin.decorate?.(editor, plugin) ?? []
  );
  if (decorateProp) {
    decorates.push(decorateProp);
  }
  if (!decorates.length) return;

  return (entry: NodeEntry) => {
    let ranges: Range[] = [];

    const addRanges = (newRanges?: Range[]) => {
      if (newRanges?.length) ranges = [...ranges, ...newRanges];
    };

    decorates.forEach((decorate) => {
      addRanges(decorate(entry));
    });

    return ranges;
  };
};
