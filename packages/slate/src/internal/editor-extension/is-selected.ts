import {
  type Editor,
  type EditorIsSelectedOptions,
  type Path,
  type TRange,
  RangeApi,
} from '../../interfaces';

export const isSelected = (
  editor: Editor,
  target: Path | TRange,
  options: EditorIsSelectedOptions = {}
) => {
  const { contains = false } = options;

  if (!editor.selection) return false;

  const range = RangeApi.isRange(target) ? target : editor.api.range(target);

  if (!range) return false;
  if (contains) {
    return RangeApi.contains(editor.selection, range);
  }

  // Check if selection intersects with path range
  return !!RangeApi.intersection(editor.selection, range);
};
