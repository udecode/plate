import type {
  RemarkElementRules,
  RemarkTextRules,
} from '../remark-slate/index';

export interface DeserializeMdPluginOptions {
  elementRules?: RemarkElementRules;
  indentList?: boolean;
  textRules?: RemarkTextRules;
}
