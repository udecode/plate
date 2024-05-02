import { nanoid, PlateEditor, TDescendant, Value } from '@udecode/plate-common/server';
import { computeDiff, ComputeDiffOptions } from '@udecode/plate-diff';

import { getSuggestionProps } from './transforms';

export function diffToSuggestions<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  doc0: TDescendant[],
  doc1: TDescendant[],
  {
    isInline = editor.isInline,
    getInsertProps = () => getSuggestionProps(editor, nanoid()),
    getDeleteProps = () =>
      getSuggestionProps(editor, nanoid(), {
        suggestionDeletion: true,
      }),
    getUpdateProps = (_node, _properties, newProperties) =>
      getSuggestionProps(editor, nanoid(), {
        suggestionUpdate: newProperties,
      }),
    ...options
  }: Partial<ComputeDiffOptions> = {}
): V {
  return computeDiff(doc0, doc1, {
    isInline,
    getInsertProps,
    getDeleteProps,
    getUpdateProps,
    ...options,
  }) as V;
}
