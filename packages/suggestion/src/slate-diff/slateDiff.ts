import { createPlateEditor, PlateEditor, TDescendant, TOperation, Value } from '@udecode/plate-common';
import {applyDiffToSuggestions} from '../diff-to-suggestions';

import { childrenToStrings } from './internal/utils/children-to-strings';
import { dmp } from './internal/utils/dmp';
import { generateOperations } from './internal/utils/generate-operations';
import { StringCharMapping } from './internal/utils/string-char-mapping';

export function slateDiff(
  doc0: TDescendant[],
  doc1: TDescendant[],
  path: number[] = []
): TOperation[] {
  const string_mapping = new StringCharMapping();

  const s0 = childrenToStrings(doc0);
  const s1 = childrenToStrings(doc1);

  const m0 = string_mapping.to_string(s0);
  const m1 = string_mapping.to_string(s1);

  const diff = dmp.diff_main(m0, m1);

  return generateOperations(diff, path, string_mapping);
}

export function diffToSuggestions<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  doc0: V,
  doc1: V,
  path: number[] = []
): TDescendant[] {
  const operations = slateDiff(doc0, doc1, path);
  const tmpEditor = createPlateEditor({ editor });
  tmpEditor.children = doc0;
  applyDiffToSuggestions(tmpEditor, operations);
  return tmpEditor.children;
}
