import type {
  Element,
  EditorUpdateTransactionOf,
  NodeEntry,
  NodeTarget,
  Path,
  Point,
  PropertyJsonValue,
  Range,
  TextInsertTextOptions,
} from 'plitejs';

import type { Editor } from '../../editor';
import type { AnyBasePlugin, PluginReference } from '../../plugin';

/** Portable default editor context for unbound input-rule factories. */
export interface InputRuleEditor extends Editor {}

export type InputRuleTarget = 'insertBreak' | 'insertData' | 'insertText';

type InputRuleInsertTextOptions = Omit<TextInsertTextOptions, 'at'> & {
  at?: NodeTarget;
};

export type MarkInputRuleMatch = {
  afterStartMatchPoint: Point;
  beforeEndMatchPoint: Point;
  beforeStartMatchPoint: Point;
  end: string | undefined;
};

type InputRuleTransaction<TEditor> = TEditor extends Editor
  ? EditorUpdateTransactionOf<TEditor>
  : never;

type BivariantCallback<TArgs extends unknown[], TResult> = {
  bivarianceHack: (...args: TArgs) => TResult;
}['bivarianceHack'];

export type SelectionInputRuleContext<TEditor = Editor> = {
  editor: TEditor;
  getBlockEntry: () => NodeEntry<Element> | undefined;
  getBlockStartRange: () => Range | undefined;
  getBlockStartText: () => string | undefined;
  getBlockTextBeforeSelection: () => string;
  getCharAfter: () => string | undefined;
  getCharBefore: () => string | undefined;
  isCollapsed: boolean;
  plugin: AnyBasePlugin;
};

export type TransformInputRuleContext<TEditor = Editor> = {
  tx: InputRuleTransaction<TEditor>;
};

export type InsertBreakInputRuleContext<TEditor = Editor> =
  SelectionInputRuleContext<TEditor> &
    TransformInputRuleContext<TEditor> & {
      cause: 'insertBreak';
      insertBreak: () => void;
    };

export type InsertDataInputRuleContext<TEditor = Editor> =
  SelectionInputRuleContext<TEditor> &
    TransformInputRuleContext<TEditor> & {
      cause: 'insertData';
      data: DataTransfer;
      insertData: (data: DataTransfer) => void;
      text: string | null;
    };

export type InsertTextInputRuleContext<TEditor = Editor> =
  SelectionInputRuleContext<TEditor> &
    TransformInputRuleContext<TEditor> & {
      cause: 'insertText';
      insertText: (text: string, options?: InputRuleInsertTextOptions) => void;
      options?: InputRuleInsertTextOptions;
      text: string;
    };

export type BaseInputRule<TContext = SelectionInputRuleContext> = {
  enabled?: BivariantCallback<[context: TContext], boolean>;
  priority?: number;
};

export type MarkInputRuleConfig = BaseInputRule<InsertTextInputRuleContext> & {
  end?: string;
  mark?: PluginReference | string;
  marks?: ReadonlyArray<PluginReference | string>;
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
    node?: PluginReference | string;
    removeMatchedText?: boolean;
    trigger: string;
  } & MatchBlockStartOptions<TMatch, InsertTextInputRuleContext>;

export type BlockFenceInputRuleMatch = BlockStartInputRuleMatch & {
  path: Path;
};

export type MatchBlockFenceOptions<TMatch = BlockFenceInputRuleMatch> = {
  block?: PluginReference | string;
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
  ) => InputRule<TMatch>;
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
  TEditor = Editor,
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
  TEditor = Editor,
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
  TEditor = Editor,
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

export type InputRule<TMatch = unknown, TEditor = Editor> =
  | InsertBreakInputRule<TMatch, TEditor>
  | InsertDataInputRule<TMatch, TEditor>
  | InsertTextInputRule<TMatch, TEditor>;

type InputRuleFactoryOptions<TOptions extends object, TRule> = TOptions & {
  enabled?: TRule extends Readonly<{ enabled?: infer TEnabled }>
    ? TEnabled
    : never;
  priority?: number;
};

/** Portable public shape for feature-owned input rule factories. */
export type InputRuleFactory<
  TOptions extends object = {},
  TRequired extends boolean = false,
  TMatch = never,
  TEditor = Editor,
  TRule extends InputRule<any, TEditor> = InputRule<TMatch, TEditor>,
> = TRequired extends true
  ? (options: InputRuleFactoryOptions<TOptions, TRule>) => TRule
  : (options?: InputRuleFactoryOptions<TOptions, TRule>) => TRule;

type StoredInsertBreakInputRule<
  TContext = unknown,
  TMatch = unknown,
  TResolved = TMatch,
> = BaseInputRule<TContext> & {
  apply: BivariantCallback<[context: TContext, match: TMatch], boolean | void>;
  resolve?: BivariantCallback<[context: TContext], TResolved>;
  target: 'insertBreak';
};

type StoredInsertDataInputRule<
  TContext = unknown,
  TMatch = unknown,
  TResolved = TMatch,
> = BaseInputRule<TContext> & {
  apply: BivariantCallback<[context: TContext, match: TMatch], boolean | void>;
  mimeTypes?: string[];
  resolve?: BivariantCallback<[context: TContext], TResolved>;
  target: 'insertData';
};

type StoredInsertTextInputRule<
  TContext = unknown,
  TMatch = unknown,
  TResolved = TMatch,
> = BaseInputRule<TContext> & {
  apply: BivariantCallback<[context: TContext, match: TMatch], boolean | void>;
  resolve?: BivariantCallback<[context: TContext], TResolved>;
  target: 'insertText';
  trigger: readonly string[] | string;
};

type StoredInputRule =
  | StoredInsertBreakInputRule
  | StoredInsertDataInputRule
  | StoredInsertTextInputRule;

type InputRuleReference =
  | StoredInsertBreakInputRule<never, never, unknown>
  | StoredInsertDataInputRule<never, never, unknown>
  | StoredInsertTextInputRule<never, never, unknown>;

export type InputRulesDefinition<TEditor = Editor> =
  | InputRulesConfig<TEditor>
  | ((ctx: InputRulesFactoryContext) => InputRulesConfig<TEditor>);

export type InputRulesConfig<TEditor = Editor> = Array<
  InputRule<any, TEditor> | InputRuleReference
>;

export type ResolvedInputRule = StoredInputRule & {
  id: string;
  plugin: AnyBasePlugin;
  priority: number;
  ruleIndex: number;
  pluginIndex: number;
};

type DeepReadonly<T> = T extends AnyBasePlugin | PluginReference
  ? T
  : T extends (...args: any[]) => unknown
    ? T
    : T extends ReadonlyArray<infer TItem>
      ? ReadonlyArray<DeepReadonly<TItem>>
      : T extends object
        ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
        : T;

type ReadonlyResolvedInputRule = DeepReadonly<ResolvedInputRule>;

export type ResolvedInputRulesMeta = Readonly<{
  insertBreak: ReadonlyArray<
    Extract<ReadonlyResolvedInputRule, { target: 'insertBreak' }>
  >;
  insertData: ReadonlyArray<
    Extract<ReadonlyResolvedInputRule, { target: 'insertData' }>
  >;
  insertText: Readonly<{
    all: ReadonlyArray<
      Extract<ReadonlyResolvedInputRule, { target: 'insertText' }>
    >;
    byTrigger: Readonly<
      Record<
        string,
        ReadonlyArray<
          Extract<ReadonlyResolvedInputRule, { target: 'insertText' }>
        >
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
