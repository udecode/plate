import { Value } from '@udecode/plate-core';
import { RemarkElementRules, RemarkTextRules } from '../remark-slate';

export interface DeserializeMdPlugin<V extends Value = Value> {
  elementRules: RemarkElementRules<V>;
  textRules: RemarkTextRules<V>;
}
