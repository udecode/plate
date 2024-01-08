import { Value } from '@udecode/plate-common';

import { RemarkElementRules, RemarkTextRules } from '../remark-slate/index';

export interface DeserializeMdPlugin<V extends Value = Value> {
  elementRules?: RemarkElementRules<V>;
  textRules?: RemarkTextRules<V>;
  indentList?: boolean;
}
