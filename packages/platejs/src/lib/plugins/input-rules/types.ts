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
} from '../../../facade';
import type { Editor } from '../../editor';
import type {
  AnyBasePlugin,
  AnyBasePluginDefinition,
  BasePluginPortal,
  DynamicBasePluginPortal,
  PluginReference,
} from '../../plugin';
import type { InternalPluginDefinitionOf } from '../../plugin/pluginDefinitionLookup.internal';
import type {
  InputRuleContinuation,
  InputRuleDecline,
} from './inputRuleContinuation.internal';

export type InputRuleTarget = 'insertBreak' | 'insertData' | 'insertText';

export type InputRuleInsertTextOptions = Omit<TextInsertTextOptions, 'at'> & {
  at?: NodeTarget;
};

type ReadPluginPortal<TPortal> = Pick<
  TPortal,
  Extract<
    keyof TPortal,
    'api' | 'installed' | 'name' | 'read' | 'schema' | 'selectors'
  >
> &
  (TPortal extends { store: infer TStore }
    ? { store: Pick<TStore, Extract<keyof TStore, 'get'>> }
    : {});

type InputRulePluginPortalFor<P extends PluginReference> = [
  InternalPluginDefinitionOf<P>,
] extends [never]
  ? ReadPluginPortal<DynamicBasePluginPortal>
  : ReadPluginPortal<
      BasePluginPortal<
        Extract<InternalPluginDefinitionOf<P>, AnyBasePluginDefinition>
      >
    >;

type InputRulePluginLookup = {
  <P extends PluginReference>(plugin: P): InputRulePluginPortalFor<P>;
  (plugin: string): ReadPluginPortal<DynamicBasePluginPortal>;
  (
    plugin: AnyBasePlugin | PluginReference | string
  ): ReadPluginPortal<DynamicBasePluginPortal>;
};

/** Read-only editor capabilities available while an input rule is selected. */
export type InputRuleEditor<TEditor = Editor> = TEditor extends {
  read: infer TRead;
}
  ? {
      readonly plugin: InputRulePluginLookup;
      readonly read: { readonly [TKey in keyof TRead]: TRead[TKey] };
    }
  : never;

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
  editor: InputRuleEditor<TEditor>;
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
  decline: () => InputRuleDecline;
  tx: InputRuleTransaction<TEditor>;
};

export type InsertBreakInputRuleReadContext<TEditor = Editor> =
  SelectionInputRuleContext<TEditor> & {
    cause: 'insertBreak';
  };

export type InsertDataInputRuleReadContext<TEditor = Editor> =
  SelectionInputRuleContext<TEditor> & {
    cause: 'insertData';
    data: DataTransfer;
    text: string | null;
  };

export type InsertTextInputRuleReadContext<TEditor = Editor> =
  SelectionInputRuleContext<TEditor> & {
    cause: 'insertText';
    options?: InputRuleInsertTextOptions;
    text: string;
  };

export type InsertBreakInputRuleContext<TEditor = Editor> =
  InsertBreakInputRuleReadContext<TEditor> &
    TransformInputRuleContext<TEditor> & {
      next: () => InputRuleContinuation;
    };

export type InsertDataInputRuleContext<TEditor = Editor> =
  InsertDataInputRuleReadContext<TEditor> &
    TransformInputRuleContext<TEditor> & {
      next: (
        data?: DataTransfer
      ) => InputRuleContinuation<DataTransfer | undefined>;
    };

export type InsertTextInputRuleContext<TEditor = Editor> =
  InsertTextInputRuleReadContext<TEditor> &
    TransformInputRuleContext<TEditor> & {
      next: (
        text?: string,
        options?: InputRuleInsertTextOptions
      ) => InputRuleContinuation<
        | {
            options?: InputRuleInsertTextOptions;
            text: string;
          }
        | undefined
      >;
    };

export type BaseInputRule<TReadContext = SelectionInputRuleContext> = {
  enabled?: BivariantCallback<[context: TReadContext], boolean>;
  priority?: number;
};

export type MarkInputRuleConfig =
  BaseInputRule<InsertTextInputRuleReadContext> & {
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
  BaseInputRule<InsertTextInputRuleReadContext> & {
    apply?: (
      context: InsertTextInputRuleContext,
      match: BlockStartInputRuleMatch & TMatch
    ) => ReturnType<InsertTextInputRule['apply']>;
    mode?: 'set' | 'toggle' | 'wrap';
    node?: PluginReference | string;
    removeMatchedText?: boolean;
    trigger: string;
  } & MatchBlockStartOptions<TMatch, InsertTextInputRuleReadContext>;

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

type BlockFenceApplyContext = SelectionInputRuleContext &
  TransformInputRuleContext;

export type BlockFenceInputRuleConfig<TMatch = BlockFenceInputRuleMatch> =
  BaseInputRule<SelectionInputRuleContext> &
    MatchBlockFenceOptions<TMatch> & {
      apply: (
        context: BlockFenceApplyContext,
        match: TMatch
      ) => InputRuleDecline | undefined;
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
  BaseInputRule<InsertTextInputRuleReadContext> & {
    patterns: TextSubstitutionPattern[];
  };

export type InsertBreakInputRule<
  TMatch = true,
  TEditor = Editor,
> = BaseInputRule<InsertBreakInputRuleReadContext<TEditor>> & {
  apply: BivariantCallback<
    [context: InsertBreakInputRuleContext<TEditor>, match: TMatch],
    InputRuleContinuation | InputRuleDecline | undefined
  >;
  resolve?: BivariantCallback<
    [context: InsertBreakInputRuleReadContext<TEditor>],
    TMatch | undefined
  >;
  target: 'insertBreak';
};

export type InsertDataInputRule<
  TMatch = true,
  TEditor = Editor,
> = BaseInputRule<InsertDataInputRuleReadContext<TEditor>> & {
  apply: BivariantCallback<
    [context: InsertDataInputRuleContext<TEditor>, match: TMatch],
    | InputRuleContinuation<DataTransfer | undefined>
    | InputRuleDecline
    | undefined
  >;
  mimeTypes?: string[];
  resolve?: BivariantCallback<
    [context: InsertDataInputRuleReadContext<TEditor>],
    TMatch | undefined
  >;
  target: 'insertData';
};

export type InsertTextInputRule<
  TMatch = true,
  TEditor = Editor,
> = BaseInputRule<InsertTextInputRuleReadContext<TEditor>> & {
  apply: BivariantCallback<
    [context: InsertTextInputRuleContext<TEditor>, match: TMatch],
    | InputRuleContinuation<
        | {
            options?: InputRuleInsertTextOptions;
            text: string;
          }
        | undefined
      >
    | InputRuleDecline
    | undefined
  >;
  resolve?: BivariantCallback<
    [context: InsertTextInputRuleReadContext<TEditor>],
    TMatch | undefined
  >;
  target: 'insertText';
  trigger: readonly string[] | string;
};

export type InputRule<TMatch = unknown, TEditor = Editor> =
  | InsertBreakInputRule<TMatch, TEditor>
  | InsertDataInputRule<TMatch, TEditor>
  | InsertTextInputRule<TMatch, TEditor>;

type StoredInputRule =
  | InsertBreakInputRule<any, any>
  | InsertDataInputRule<any, any>
  | InsertTextInputRule<any, any>;

type InputRuleReference =
  | (BaseInputRule<never> & {
      apply: BivariantCallback<[context: never, match: never], unknown>;
      resolve?: BivariantCallback<[context: never], unknown>;
      target: 'insertBreak';
    })
  | (BaseInputRule<never> & {
      apply: BivariantCallback<[context: never, match: never], unknown>;
      mimeTypes?: string[];
      resolve?: BivariantCallback<[context: never], unknown>;
      target: 'insertData';
    })
  | (BaseInputRule<never> & {
      apply: BivariantCallback<[context: never, match: never], unknown>;
      resolve?: BivariantCallback<[context: never], unknown>;
      target: 'insertText';
      trigger: readonly string[] | string;
    });

export type InputRulesDefinition<TEditor = Editor> = InputRulesConfig<TEditor>;

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
