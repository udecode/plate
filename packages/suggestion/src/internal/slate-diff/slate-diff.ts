import { TDescendant, TOperation } from '@udecode/plate-common';

import { StringCharMapping } from './string-char-mapping';
import { childrenToStrings } from './utils/children-to-strings';
import { dmp } from './utils/dmp';
import { generateOperations } from './utils/generate-operations';

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
