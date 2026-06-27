import type { BaseEditor } from '../../editor';
import type {
  AnyInputRule,
  InsertBreakInputRule,
  InsertDataInputRule,
  InsertTextInputRule,
} from './types';

export function defineInputRule<
  TMatch = true,
  TEditor extends BaseEditor = BaseEditor,
>(
  rule: InsertBreakInputRule<TMatch, TEditor>
): InsertBreakInputRule<TMatch, TEditor>;
export function defineInputRule<
  TMatch = true,
  TEditor extends BaseEditor = BaseEditor,
>(
  rule: InsertDataInputRule<TMatch, TEditor>
): InsertDataInputRule<TMatch, TEditor>;
export function defineInputRule<
  TMatch = true,
  TEditor extends BaseEditor = BaseEditor,
>(
  rule: InsertTextInputRule<TMatch, TEditor>
): InsertTextInputRule<TMatch, TEditor>;
export function defineInputRule<TRule extends AnyInputRule>(rule: TRule): TRule;
export function defineInputRule<TRule extends AnyInputRule>(rule: TRule) {
  return rule;
}
