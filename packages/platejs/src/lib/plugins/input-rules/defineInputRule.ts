import type { Value } from '../../../facade';
import type { Editor } from '../../editor';
import type { AnyBasePlugin, PluginReference } from '../../plugin';
import type {
  InputRule,
  InsertBreakInputRule,
  InsertBreakInputRuleContext,
  InsertBreakInputRuleReadContext,
  InsertDataInputRule,
  InsertDataInputRuleContext,
  InsertDataInputRuleReadContext,
  InsertTextInputRule,
  InsertTextInputRuleContext,
  InsertTextInputRuleReadContext,
} from './types';

type InputRuleOwner = AnyBasePlugin & PluginReference;
type OwnerEditor<P extends InputRuleOwner> = Editor<Value, readonly [], P>;

type BoundResolvedInsertBreakRule<P extends InputRuleOwner, TMatch> = Omit<
  InsertBreakInputRule<TMatch, OwnerEditor<P>>,
  'apply' | 'resolve'
> & {
  apply: (
    context: InsertBreakInputRuleContext<OwnerEditor<P>>,
    match: NoInfer<TMatch>
  ) => ReturnType<InsertBreakInputRule<TMatch, OwnerEditor<P>>['apply']>;
  resolve: (
    context: InsertBreakInputRuleReadContext<OwnerEditor<P>>
  ) => TMatch | undefined;
};

type BoundResolvedInsertDataRule<P extends InputRuleOwner, TMatch> = Omit<
  InsertDataInputRule<TMatch, OwnerEditor<P>>,
  'apply' | 'resolve'
> & {
  apply: (
    context: InsertDataInputRuleContext<OwnerEditor<P>>,
    match: NoInfer<TMatch>
  ) => ReturnType<InsertDataInputRule<TMatch, OwnerEditor<P>>['apply']>;
  resolve: (
    context: InsertDataInputRuleReadContext<OwnerEditor<P>>
  ) => TMatch | undefined;
};

type BoundResolvedInsertTextRule<P extends InputRuleOwner, TMatch> = Omit<
  InsertTextInputRule<TMatch, OwnerEditor<P>>,
  'apply' | 'resolve'
> & {
  apply: (
    context: InsertTextInputRuleContext<OwnerEditor<P>>,
    match: NoInfer<TMatch>
  ) => ReturnType<InsertTextInputRule<TMatch, OwnerEditor<P>>['apply']>;
  resolve: (
    context: InsertTextInputRuleReadContext<OwnerEditor<P>>
  ) => TMatch | undefined;
};

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
export function defineInputRule<P extends InputRuleOwner, TMatch>(
  owner: P,
  rule: BoundResolvedInsertBreakRule<P, TMatch>
): InsertBreakInputRule<TMatch, OwnerEditor<P>>;
export function defineInputRule<P extends InputRuleOwner, TMatch>(
  owner: P,
  rule: BoundResolvedInsertDataRule<P, TMatch>
): InsertDataInputRule<TMatch, OwnerEditor<P>>;
export function defineInputRule<P extends InputRuleOwner, TMatch>(
  owner: P,
  rule: BoundResolvedInsertTextRule<P, TMatch>
): InsertTextInputRule<TMatch, OwnerEditor<P>>;
export function defineInputRule<P extends InputRuleOwner>(
  owner: P,
  rule: InsertBreakInputRule<true, OwnerEditor<P>>
): InsertBreakInputRule<true, OwnerEditor<P>>;
export function defineInputRule<P extends InputRuleOwner>(
  owner: P,
  rule: InsertDataInputRule<true, OwnerEditor<P>>
): InsertDataInputRule<true, OwnerEditor<P>>;
export function defineInputRule<P extends InputRuleOwner>(
  owner: P,
  rule: InsertTextInputRule<true, OwnerEditor<P>>
): InsertTextInputRule<true, OwnerEditor<P>>;
export function defineInputRule<TRule extends InputRule>(
  ownerOrRule: InputRuleOwner | TRule,
  rule?: TRule
) {
  return rule ?? ownerOrRule;
}
