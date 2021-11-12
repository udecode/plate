import { NodeEntry, Range } from 'slate';
import { EditableProps } from 'slate-react/dist/components/editable';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';

/**
 * @see {@link Decorate}.
 * Optimization: return undefined if empty list so Editable uses a memo.
 */
export const pipeDecorate = (
  editor: PlateEditor,
  plugins: PlatePlugin[] = []
): EditableProps['decorate'] => {
  const decorates = plugins.flatMap(
    (plugin) => plugin.decorate?.(editor, plugin) ?? []
  );
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
