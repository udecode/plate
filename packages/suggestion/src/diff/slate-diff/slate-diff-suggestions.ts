import {
  PlateEditor,
  TDescendant,
  TOperation,
  withoutNormalizing,
} from '@udecode/plate-common';

import { StringCharMapping } from './string-char-mapping';
import { childrenToStrings } from './utils/children-to-strings';
import { dmp } from './utils/dmp';
import { generateSuggestions } from './utils/generate-suggestions';

export function slateDiffSuggestions(
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

  return generateSuggestions(diff, path, string_mapping);
}

export const applyDiffSuggestions = (
  editor: PlateEditor,
  operations: TOperation[]
) => {
  withoutNormalizing(editor, () => {
    operations.forEach((op) => {
      editor.apply(op);
    });
  });
};
