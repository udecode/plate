import type {
  InsertTextOptions,
  NodeEntry,
  Path,
  Point,
  TRange,
} from '@platejs/slate';

import type { SlateEditor } from '../../editor';

export type InputRuleTarget = 'insertBreak' | 'insertData' | 'insertText';

type BivariantCallback<TArgs extends unknown[], TResult> = {
  bivarianceHack: (...args: TArgs) => TResult;
}['bivarianceHack'];

export type SelectionInputRuleContext<
  TEditor extends SlateEditor = SlateEditor,
> = {
  editor: TEditor;
  getBlockEntry: () => NodeEntry | undefined;
  getBlockStartRange: () => TRange | undefined;
  getBlockStartText: () => string | undefined;
  getBlockTextBeforeSelection: () => string;
  getCharAfter: () => string | undefined;
  getCharBefore: () => string | undefined;
  isCollapsed: boolean;
  pluginKey: string;
};

export type InsertBreakInputRuleContext<
  TEditor extends SlateEditor = SlateEditor,
> = SelectionInputRuleContext<TEditor> & {
  cause: 'insertBreak';
  insertBreak: () => void;
};

export type InsertDataInputRuleContext<
  TEditor extends SlateEditor = SlateEditor,
> = SelectionInputRuleContext<TEditor> & {
  cause: 'insertData';
  data: DataTransfer;
  insertData: (data: DataTransfer) => void;
  text: string | null;
};

export type InsertTextInputRuleContext<
  TEditor extends SlateEditor = SlateEditor,
> = SelectionInputRuleContext<TEditor> & {
  cause: 'insertText';
  insertText: (text: string, options?: InsertTextOptions) => void;
  options?: InsertTextOptions;
  text: string;
};

export type BaseInputRule<
  TContext extends SelectionInputRuleContext = SelectionInputRuleContext,
> = {
  enabled?: BivariantCallback<[context: TContext], boolean>;
  priority?: number;
};

export type MarkInputRuleConfig = BaseInputRule<InsertTextInputRuleContext> & {
  end?: string;
  mark?: string;
  marks?: string[];
  start: string;
  trim?: 'allow' | 'reject';
  trigger: string;
};

export type BlockStartInputRuleMatch = {
  range: TRange;
  text: string;
};

export type MatchBlockStartOptions<
  TMatch extends object = {},
  TContext extends SelectionInputRuleContext = SelectionInputRuleContext,
> = {
  match: RegExp | string | ((context: TContext) => RegExp | string | undefined);
  resolveMatch?: (args: {
    match: RegExpMatchArray | string;
    range: TRange;
    text: string;
  }) => TMatch | undefined;
};

export type BlockStartInputRuleConfig<TMatch extends object = {}> =
  BaseInputRule<InsertTextInputRuleContext> & {
    apply?: (
      context: InsertTextInputRuleContext,
      match: BlockStartInputRuleMatch & TMatch
    ) => boolean | void;
    mode?: 'set' | 'toggle' | 'wrap';
    node?: string;
    removeMatchedText?: boolean;
    trigger: string;
  } & MatchBlockStartOptions<TMatch, InsertTextInputRuleContext>;

export type BlockFenceInputRuleMatch = BlockStartInputRuleMatch & {
  path: Path;
};

export type MatchBlockFenceOptions<TMatch = BlockFenceInputRuleMatch> = {
  block?: string;
  fence: string;
  resolveMatch?: (args: {
    fence: string;
    path: Path;
    range: TRange;
    text: string;
  }) => TMatch | undefined;
};

export type BlockFenceInputRuleConfig<TMatch = BlockFenceInputRuleMatch> =
  BaseInputRule<SelectionInputRuleContext> &
    MatchBlockFenceOptions<TMatch> & {
      apply: (
        context: SelectionInputRuleContext,
        match: TMatch
      ) => boolean | void;
      on: 'break' | 'match';
    };

export type DelimitedInlineInputRuleMatch = {
  content: string;
  deleteRange: TRange;
};

export type MatchDelimitedInlineOptions = {
  boundaryRe?: RegExp;
  close?: string;
  followRe?: RegExp;
  open: string;
  rejectRepeatedOpen?: boolean;
  requireClosingDelimiter?: boolean;
  trim?: 'allow' | 'reject';
};

export type TextSubstitutionPattern = {
  format: readonly [string, string] | string;
  match: readonly string[] | string;
  trigger?: readonly string[] | string;
};

export type TextSubstitutionMatch = {
  end: string;
  pattern: TextSubstitutionPattern;
  points: {
    afterStartMatchPoint: Point | undefined;
    beforeEndMatchPoint: Point;
    beforeStartMatchPoint: Point | undefined;
  };
};

export type TextSubstitutionInputRuleConfig =
  BaseInputRule<InsertTextInputRuleContext> & {
    patterns: TextSubstitutionPattern[];
  };

export type InputRuleBuilder = {
  blockFence: <TMatch = BlockFenceInputRuleMatch>(
    config: BlockFenceInputRuleConfig<TMatch>
  ) => AnyInputRule<TMatch>;
  blockStart: <TMatch extends object = {}>(
    config: BlockStartInputRuleConfig<TMatch>
  ) => InsertTextInputRule<BlockStartInputRuleMatch & TMatch>;
  insertBreak: <TMatch = true>(
    rule: InsertBreakInputRule<TMatch>
  ) => InsertBreakInputRule<TMatch>;
  insertData: <TMatch = true>(
    rule: InsertDataInputRule<TMatch>
  ) => InsertDataInputRule<TMatch>;
  insertText: <TMatch = true>(
    rule: InsertTextInputRule<TMatch>
  ) => InsertTextInputRule<TMatch>;
  mark: (config: MarkInputRuleConfig) => InsertTextInputRule<{
    afterStartMatchPoint: Point;
    beforeEndMatchPoint: Point;
    beforeStartMatchPoint: Point;
    end: string | undefined;
  }>;
};

export type InputRulesFactoryContext = {
  rule: InputRuleBuilder;
};

export type InsertBreakInputRule<
  TMatch = true,
  TEditor extends SlateEditor = SlateEditor,
> = BaseInputRule<InsertBreakInputRuleContext<TEditor>> & {
  apply: BivariantCallback<
    [context: InsertBreakInputRuleContext<TEditor>, match: TMatch],
    boolean | void
  >;
  resolve?: BivariantCallback<
    [context: InsertBreakInputRuleContext<TEditor>],
    TMatch | undefined
  >;
  target: 'insertBreak';
};

export type InsertDataInputRule<
  TMatch = true,
  TEditor extends SlateEditor = SlateEditor,
> = BaseInputRule<InsertDataInputRuleContext<TEditor>> & {
  apply: BivariantCallback<
    [context: InsertDataInputRuleContext<TEditor>, match: TMatch],
    boolean | void
  >;
  mimeTypes?: string[];
  resolve?: BivariantCallback<
    [context: InsertDataInputRuleContext<TEditor>],
    TMatch | undefined
  >;
  target: 'insertData';
};

export type InsertTextInputRule<
  TMatch = true,
  TEditor extends SlateEditor = SlateEditor,
> = BaseInputRule<InsertTextInputRuleContext<TEditor>> & {
  apply: BivariantCallback<
    [context: InsertTextInputRuleContext<TEditor>, match: TMatch],
    boolean | void
  >;
  resolve?: BivariantCallback<
    [context: InsertTextInputRuleContext<TEditor>],
    TMatch | undefined
  >;
  target: 'insertText';
  trigger: readonly string[] | string;
};

export type AnyInputRule<
  TMatch = unknown,
  TEditor extends SlateEditor = SlateEditor,
> =
  | InsertBreakInputRule<TMatch, TEditor>
  | InsertDataInputRule<TMatch, TEditor>
  | InsertTextInputRule<TMatch, TEditor>;

type StoredInsertBreakInputRule = BaseInputRule<InsertBreakInputRuleContext> & {
  apply: BivariantCallback<
    [context: InsertBreakInputRuleContext, match: unknown],
    boolean | void
  >;
  resolve?: BivariantCallback<[context: InsertBreakInputRuleContext], unknown>;
  target: 'insertBreak';
};

type StoredInsertDataInputRule = BaseInputRule<InsertDataInputRuleContext> & {
  apply: BivariantCallback<
    [context: InsertDataInputRuleContext, match: unknown],
    boolean | void
  >;
  mimeTypes?: string[];
  resolve?: BivariantCallback<[context: InsertDataInputRuleContext], unknown>;
  target: 'insertData';
};

type StoredInsertTextInputRule = BaseInputRule<InsertTextInputRuleContext> & {
  apply: BivariantCallback<
    [context: InsertTextInputRuleContext, match: unknown],
    boolean | void
  >;
  resolve?: BivariantCallback<[context: InsertTextInputRuleContext], unknown>;
  target: 'insertText';
  trigger: readonly string[] | string;
};

type StoredInputRule =
  | StoredInsertBreakInputRule
  | StoredInsertDataInputRule
  | StoredInsertTextInputRule;

export type InputRulesDefinition =
  | InputRulesConfig
  | ((ctx: InputRulesFactoryContext) => InputRulesConfig);

export type InputRulesConfig = AnyInputRule<any, SlateEditor>[];

export type ResolvedInputRule = StoredInputRule & {
  id: string;
  pluginKey: string;
  priority: number;
  ruleIndex: number;
  pluginIndex: number;
};

export type ResolvedInputRulesMeta = {
  insertBreak: Extract<ResolvedInputRule, { target: 'insertBreak' }>[];
  insertData: Extract<ResolvedInputRule, { target: 'insertData' }>[];
  insertText: {
    all: Extract<ResolvedInputRule, { target: 'insertText' }>[];
    byTrigger: Record<
      string,
      Extract<ResolvedInputRule, { target: 'insertText' }>[]
    >;
  };
  plugins: Record<
    string,
    {
      rules: ResolvedInputRule[];
    }
  >;
};
