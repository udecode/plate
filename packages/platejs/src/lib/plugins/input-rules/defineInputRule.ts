import type { Editor } from '../../editor';
import type {
  InputRule,
  InsertBreakInputRule,
  InsertDataInputRule,
  InsertTextInputRule,
} from './types';

export function defineInputRule<TMatch = true, TEditor extends Editor = Editor>(
  rule: InsertBreakInputRule<TMatch, TEditor>
): InsertBreakInputRule<TMatch, TEditor>;
export function defineInputRule<TMatch = true, TEditor extends Editor = Editor>(
  rule: InsertDataInputRule<TMatch, TEditor>
): InsertDataInputRule<TMatch, TEditor>;
export function defineInputRule<TMatch = true, TEditor extends Editor = Editor>(
  rule: InsertTextInputRule<TMatch, TEditor>
): InsertTextInputRule<TMatch, TEditor>;
export function defineInputRule<TRule extends InputRule>(rule: TRule): TRule;
export function defineInputRule<TRule extends InputRule>(rule: TRule) {
  return rule;
}
