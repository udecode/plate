import type { Value } from '@udecode/plate-common/server';

import type {
  RemarkElementRules,
  RemarkTextRules,
} from '../remark-slate/index';

export interface DeserializeMdPlugin<V extends Value = Value> {
  elementRules?: RemarkElementRules<V>;
  indentList?: boolean;
  textRules?: RemarkTextRules<V>;
}
