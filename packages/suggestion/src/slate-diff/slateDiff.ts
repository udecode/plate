import { nanoid, PlateEditor, TDescendant, Value } from '@udecode/plate-common';

import { getSuggestionProps } from '../transforms';
import { childrenToStrings } from './internal/utils/children-to-strings';
import { dmp } from './internal/utils/dmp';
import { generateOperations } from './internal/utils/generate-operations';
import { StringCharMapping } from './internal/utils/string-char-mapping';

export interface DiffToSuggestionsOptions {
  getInsertProps?: (node: TDescendant) => any;
  getRemoveProps?: (node: TDescendant) => any;
  getUpdateProps?: (node: TDescendant, oldProps: any, newProps: any) => any;
}

export function diffToSuggestions<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  doc0: TDescendant[],
  doc1: TDescendant[],
  {
    getInsertProps = () => getSuggestionProps(editor, nanoid()),
    getRemoveProps = () =>
      getSuggestionProps(editor, nanoid(), {
        suggestionDeletion: true,
      }),
    getUpdateProps = (_node, _oldProps, newProps) =>
      getSuggestionProps(editor, nanoid(), {
        suggestionUpdate: newProps,
      }),
  }: DiffToSuggestionsOptions = {}
): TDescendant[] {
  const stringCharMapping = new StringCharMapping();

  const s0 = childrenToStrings(doc0);
  const s1 = childrenToStrings(doc1);

  const m0 = stringCharMapping.to_string(s0);
  const m1 = stringCharMapping.to_string(s1);

  const diff = dmp.diff_main(m0, m1);

  return generateOperations<V, E>(editor, diff, {
    getInsertProps,
    getRemoveProps,
    getUpdateProps,
    stringCharMapping,
  });
}
