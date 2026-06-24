import type { BasePlateEditor } from '../../editor';
import type {
  AnyInputRule,
  InsertBreakInputRule,
  InsertDataInputRule,
  InsertTextInputRule,
} from './types';

export function defineInputRule<
  TMatch = true,
  TEditor extends BasePlateEditor = BasePlateEditor,
>(
  rule: InsertBreakInputRule<TMatch, TEditor>
): InsertBreakInputRule<TMatch, TEditor>;
export function defineInputRule<
  TMatch = true,
  TEditor extends BasePlateEditor = BasePlateEditor,
>(
  rule: InsertDataInputRule<TMatch, TEditor>
): InsertDataInputRule<TMatch, TEditor>;
export function defineInputRule<
  TMatch = true,
  TEditor extends BasePlateEditor = BasePlateEditor,
>(
  rule: InsertTextInputRule<TMatch, TEditor>
): InsertTextInputRule<TMatch, TEditor>;
export function defineInputRule<TRule extends AnyInputRule>(rule: TRule): TRule;
export function defineInputRule<TRule extends AnyInputRule>(rule: TRule) {
  return rule;
}
