import { Value } from '@udecode/slate';
import { Range } from 'slate';
import { PlateEditor } from '../types/PlateEditor';
import { TEditableProps } from '../types/slate-react/TEditableProps';

/**
 * @see {@link Decorate}.
 * Optimization: return undefined if empty list so Editable uses a memo.
 */
export const pipeDecorate = <V extends Value>(
  editor: PlateEditor<V>,
  decorateProp?: TEditableProps<V>['decorate']
): TEditableProps<V>['decorate'] => {
  const decorates = editor.plugins.flatMap(
    (plugin) => plugin.decorate?.(editor, plugin) ?? []
  );
  if (decorateProp) {
    decorates.push(decorateProp);
  }
  if (decorates.length === 0) return;

  return (entry) => {
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
