import {
  type Descendant,
  type SlateEditor,
  type ValueOf,
  nanoid,
} from '@udecode/plate';
import { type ComputeDiffOptions, computeDiff } from '@udecode/plate-diff';

import { getSuggestionProps } from './transforms';

// TODO: refactor
export function diffToSuggestions<E extends SlateEditor>(
  editor: E,
  doc0: Descendant[],
  doc1: Descendant[],
  {
    getDeleteProps = () =>
      getSuggestionProps(editor, nanoid(), {
        suggestionDeletion: true,
      }),
    getInsertProps = () => getSuggestionProps(editor, nanoid()),
    getUpdateProps = (_node, _properties, newProperties) =>
      getSuggestionProps(editor, nanoid(), {
        suggestionUpdate: newProperties,
      }),
    isInline = editor.api.isInline,
    ...options
  }: Partial<ComputeDiffOptions> = {}
): ValueOf<E> {
  return computeDiff(doc0, doc1, {
    getDeleteProps,
    getInsertProps,
    getUpdateProps,
    isInline,
    ...options,
  }) as ValueOf<E>;
}
