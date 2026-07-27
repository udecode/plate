import type {
  Element,
  EditorTransactionSpecBuilder,
  ExtensionsOf,
  NodeEntry,
  Path,
  Point,
  PropertyJsonValue,
  Range,
  TextInsertTextOptions,
  ValueOf,
} from '@platejs/plite';

import type { BaseEditor } from '../../editor';

export type InputRuleTarget = 'insertBreak' | 'insertData' | 'insertText';

type InputRuleTransaction<TEditor> = BaseEditor extends TEditor
  ? EditorTransactionSpecBuilder<ValueOf<TEditor>>
  : EditorTransactionSpecBuilder<ValueOf<TEditor>, ExtensionsOf<TEditor>>;

type BivariantCallback<TArgs extends unknown[], TResult> = {
  bivarianceHack: (...args: TArgs) => TResult;
}['bivarianceHack'];

export type SelectionInputRuleContext<TEditor = BaseEditor> = {
  editor: TEditor;
  getBlockEntry: () => NodeEntry<Element> | undefined;
  getBlockStartRange: () => Range | undefined;
  getBlockStartText: () => string | undefined;
  getBlockTextBeforeSelection: () => string;
  getCharAfter: () => string | undefined;
  getCharBefore: () => string | undefined;
  isCollapsed: boolean;
  pluginKey: string;
};

export type TransformInputRuleContext<TEditor = BaseEditor> = {
  tx: InputRuleTransaction<TEditor>;
};

export type InsertBreakInputRuleContext<TEditor = BaseEditor> =
  SelectionInputRuleContext<TEditor> &
    TransformInputRuleContext<TEditor> & {
      cause: 'insertBreak';
      insertBreak: () => void;
    };

export type InsertDataInputRuleContext<TEditor = BaseEditor> =
  SelectionInputRuleContext<TEditor> &
    TransformInputRuleContext<TEditor> & {
      cause: 'insertData';
      data: DataTransfer;
      insertData: (data: DataTransfer) => void;
      text: string | null;
    };

export type InsertTextInputRuleContext<TEditor = BaseEditor> =
  SelectionInputRuleContext<TEditor> &
    TransformInputRuleContext<TEditor> & {
      cause: 'insertText';
      insertText: (text: string, options?: TextInsertTextOptions) => void;
      options?: TextInsertTextOptions;
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
  value?: PropertyJsonValue;
};

export type BlockStartInputRuleMatch = {
  range: Range;
  text: string;
};

export type MatchBlockStartOptions<
  TMatch extends object = {},
  TContext extends SelectionInputRuleContext = SelectionInputRuleContext,
> = {
  match: RegExp | string | ((context: TContext) => RegExp | string | undefined);
  resolveMatch?: (args: {
    match: RegExpMatchArray | string;
    range: Range;
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
    range: Range;
    text: string;
  }) => TMatch | undefined;
};

export type BlockFenceInputRuleConfig<TMatch = BlockFenceInputRuleMatch> =
  BaseInputRule<SelectionInputRuleContext & TransformInputRuleContext> &
    MatchBlockFenceOptions<TMatch> & {
      apply: (
        context: SelectionInputRuleContext & TransformInputRuleContext,
        match: TMatch
      ) => boolean | void;
      on: 'break' | 'match';
    };

export type DelimitedInlineInputRuleMatch = {
  content: string;
  deleteRange: Range;
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
  TEditor extends BaseEditor = BaseEditor,
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
  TEditor extends BaseEditor = BaseEditor,
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
  TEditor extends BaseEditor = BaseEditor,
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
  TEditor extends BaseEditor = BaseEditor,
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

export type InputRulesConfig = AnyInputRule<any, BaseEditor>[];

export type ResolvedInputRule = StoredInputRule & {
  id: string;
  pluginKey: string;
  priority: number;
  ruleIndex: number;
  pluginIndex: number;
};

type DeepReadonly<T> = T extends (...args: any[]) => unknown
  ? T
  : T extends readonly (infer TItem)[]
    ? readonly DeepReadonly<TItem>[]
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

type ReadonlyResolvedInputRule = DeepReadonly<ResolvedInputRule>;

export type ResolvedInputRulesMeta = Readonly<{
  insertBreak: readonly Extract<
    ReadonlyResolvedInputRule,
    { target: 'insertBreak' }
  >[];
  insertData: readonly Extract<
    ReadonlyResolvedInputRule,
    { target: 'insertData' }
  >[];
  insertText: Readonly<{
    all: readonly Extract<
      ReadonlyResolvedInputRule,
      { target: 'insertText' }
    >[];
    byTrigger: Readonly<
      Record<
        string,
        readonly Extract<ReadonlyResolvedInputRule, { target: 'insertText' }>[]
      >
    >;
  }>;
  plugins: Readonly<
    Record<
      string,
      Readonly<{
        rules: readonly ReadonlyResolvedInputRule[];
      }>
    >
  >;
}>;
