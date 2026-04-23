import type {
  AnyInputRule,
  BlockFenceInputRuleConfig,
  BlockFenceInputRuleMatch,
  BlockStartInputRuleConfig,
  BlockStartInputRuleMatch,
  InsertBreakInputRule,
  InsertBreakInputRuleContext,
  InsertDataInputRule,
  InsertDataInputRuleContext,
  InsertTextInputRule,
  InsertTextInputRuleContext,
  MarkInputRuleConfig,
  SelectionInputRuleContext,
  TextSubstitutionInputRuleConfig,
} from './types';

import {
  createBlockFenceInputRule,
  createBlockStartInputRule,
  createMarkInputRule,
  createTextSubstitutionInputRule,
} from './createInputRules';
import { defineInputRule } from './defineInputRule';

type FactoryValue<TInput, TValue> = TValue | ((input: TInput) => TValue);

type Simplify<T> = { [K in keyof T]: T[K] } & {};

type BivariantCallback<T extends (...args: never[]) => unknown> = {
  bivarianceHack: T;
}['bivarianceHack'];

type RuntimeOptions<TContext> = {
  enabled?: (context: TContext) => boolean;
  priority?: number;
};

type FactoryInput<
  TContext,
  TDefaults extends object,
  TRequired extends object,
> = TContext & TDefaults & TRequired;

type PublicOptions<
  TContext,
  TDefaults extends object,
  TRequired extends object,
> = Simplify<Partial<TDefaults> & TRequired & RuntimeOptions<TContext>>;

type CreateRuleFactoryReturn<
  TContext,
  TDefaults extends object,
  TRequired extends object,
> = keyof TRequired extends never
  ? (
      options?: PublicOptions<TContext, TDefaults, TRequired>
    ) => AnyInputRule<unknown>
  : (
      options: PublicOptions<TContext, TDefaults, TRequired>
    ) => AnyInputRule<unknown>;

type RuleFactoryConfigBuilder<
  TContext,
  TDefaults extends object,
  TRequired extends object,
  TConfig,
> = (options: PublicOptions<TContext, TDefaults, TRequired>) => TConfig;

type MarkRuleFactoryConfig<
  TDefaults extends object,
  TRequired extends object,
> = {
  type: 'mark';
  end?: FactoryValue<
    FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>,
    string | undefined
  >;
  mark?: FactoryValue<
    FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>,
    string | undefined
  >;
  marks?: FactoryValue<
    FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>,
    string[] | undefined
  >;
  start: FactoryValue<
    FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>,
    string
  >;
  trim?: FactoryValue<
    FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>,
    MarkInputRuleConfig['trim']
  >;
  trigger: FactoryValue<
    FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>,
    string
  >;
  enabled?: (
    input: FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>
  ) => boolean;
  priority?: number;
};

type BlockStartRuleFactoryConfig<
  TDefaults extends object,
  TRequired extends object,
  TMatch extends object = {},
> = {
  type: 'blockStart';
  apply?: BivariantCallback<
    (
      input: FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>,
      match: BlockStartInputRuleMatch & TMatch
    ) => boolean | void
  >;
  match: FactoryValue<
    FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>,
    RegExp | string | undefined
  >;
  mode?: FactoryValue<
    FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>,
    BlockStartInputRuleConfig<TMatch>['mode']
  >;
  node?: FactoryValue<
    FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>,
    string | undefined
  >;
  removeMatchedText?: FactoryValue<
    FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>,
    boolean | undefined
  >;
  resolveMatch?: (
    args: {
      match: RegExpMatchArray | string;
      range: BlockStartInputRuleMatch['range'];
      text: string;
    },
    input: FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>
  ) => TMatch | undefined;
  trigger: FactoryValue<
    FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>,
    string
  >;
  enabled?: (
    input: FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>
  ) => boolean;
  priority?: number;
};

type BlockFenceRuleFactoryConfig<
  TDefaults extends object,
  TRequired extends object,
  TMatch,
> = {
  type: 'blockFence';
  apply: BivariantCallback<
    (
      input: FactoryInput<SelectionInputRuleContext, TDefaults, TRequired>,
      match: TMatch
    ) => boolean | void
  >;
  block?: FactoryValue<
    FactoryInput<SelectionInputRuleContext, TDefaults, TRequired>,
    string | undefined
  >;
  fence: FactoryValue<
    FactoryInput<SelectionInputRuleContext, TDefaults, TRequired>,
    string
  >;
  on?: FactoryValue<
    FactoryInput<SelectionInputRuleContext, TDefaults, TRequired>,
    BlockFenceInputRuleConfig<TMatch>['on']
  >;
  resolveMatch?: (
    args: {
      fence: string;
      path: BlockFenceInputRuleMatch['path'];
      range: BlockFenceInputRuleMatch['range'];
      text: string;
    },
    input: FactoryInput<SelectionInputRuleContext, TDefaults, TRequired>
  ) => TMatch | undefined;
  enabled?: (
    input: FactoryInput<SelectionInputRuleContext, TDefaults, TRequired>
  ) => boolean;
  priority?: number;
};

type InsertTextRuleFactoryConfig<
  TDefaults extends object,
  TRequired extends object,
  TMatch,
> = {
  type: 'insertText';
  apply: BivariantCallback<
    (
      input: FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>,
      match: TMatch
    ) => boolean | void
  >;
  resolve?: (
    input: FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>
  ) => TMatch | undefined;
  trigger: FactoryValue<
    FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>,
    InsertTextInputRule<TMatch>['trigger']
  >;
  enabled?: (
    input: FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>
  ) => boolean;
  priority?: number;
};

type InsertBreakRuleFactoryConfig<
  TDefaults extends object,
  TRequired extends object,
  TMatch,
> = {
  type: 'insertBreak';
  apply: BivariantCallback<
    (
      input: FactoryInput<InsertBreakInputRuleContext, TDefaults, TRequired>,
      match: TMatch
    ) => boolean | void
  >;
  resolve?: (
    input: FactoryInput<InsertBreakInputRuleContext, TDefaults, TRequired>
  ) => TMatch | undefined;
  enabled?: (
    input: FactoryInput<InsertBreakInputRuleContext, TDefaults, TRequired>
  ) => boolean;
  priority?: number;
};

type InsertDataRuleFactoryConfig<
  TDefaults extends object,
  TRequired extends object,
  TMatch,
> = {
  type: 'insertData';
  apply: BivariantCallback<
    (
      input: FactoryInput<InsertDataInputRuleContext, TDefaults, TRequired>,
      match: TMatch
    ) => boolean | void
  >;
  mimeTypes?: FactoryValue<
    FactoryInput<InsertDataInputRuleContext, TDefaults, TRequired>,
    string[] | undefined
  >;
  resolve?: (
    input: FactoryInput<InsertDataInputRuleContext, TDefaults, TRequired>
  ) => TMatch | undefined;
  enabled?: (
    input: FactoryInput<InsertDataInputRuleContext, TDefaults, TRequired>
  ) => boolean;
  priority?: number;
};

type TextSubstitutionRuleFactoryConfig<
  TDefaults extends object,
  TRequired extends object,
> = {
  type: 'textSubstitution';
  patterns: FactoryValue<
    FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>,
    TextSubstitutionInputRuleConfig['patterns']
  >;
  enabled?: (
    input: FactoryInput<InsertTextInputRuleContext, TDefaults, TRequired>
  ) => boolean;
  priority?: number;
};

type AnyRuleFactoryConfig<
  TDefaults extends object = Record<string, unknown>,
  TRequired extends object = Record<string, unknown>,
  TMatch = unknown,
> =
  | MarkRuleFactoryConfig<TDefaults, TRequired>
  | BlockStartRuleFactoryConfig<
      TDefaults,
      TRequired,
      TMatch extends object ? TMatch : {}
    >
  | BlockFenceRuleFactoryConfig<TDefaults, TRequired, TMatch>
  | InsertTextRuleFactoryConfig<TDefaults, TRequired, TMatch>
  | InsertBreakRuleFactoryConfig<TDefaults, TRequired, TMatch>
  | InsertDataRuleFactoryConfig<TDefaults, TRequired, TMatch>
  | TextSubstitutionRuleFactoryConfig<TDefaults, TRequired>;

type AnyRuleFactoryConfigLoose<
  TDefaults extends object = Record<string, unknown>,
  TRequired extends object = Record<string, unknown>,
> =
  | MarkRuleFactoryConfig<TDefaults, TRequired>
  | BlockStartRuleFactoryConfig<TDefaults, TRequired, {}>
  | BlockFenceRuleFactoryConfig<TDefaults, TRequired, unknown>
  | InsertTextRuleFactoryConfig<TDefaults, TRequired, unknown>
  | InsertBreakRuleFactoryConfig<TDefaults, TRequired, unknown>
  | InsertDataRuleFactoryConfig<TDefaults, TRequired, unknown>
  | TextSubstitutionRuleFactoryConfig<TDefaults, TRequired>;

type ContextFromFactoryConfig<TConfig> = TConfig extends
  | MarkRuleFactoryConfig<any, any>
  | BlockStartRuleFactoryConfig<any, any, any>
  | InsertTextRuleFactoryConfig<any, any, any>
  | TextSubstitutionRuleFactoryConfig<any, any>
  ? InsertTextInputRuleContext
  : TConfig extends BlockFenceRuleFactoryConfig<any, any, any>
    ? SelectionInputRuleContext
    : TConfig extends InsertBreakRuleFactoryConfig<any, any, any>
      ? InsertBreakInputRuleContext
      : InsertDataInputRuleContext;

const getMergedInput = <TContext extends object, TOptions extends object>(
  context: TContext,
  options: TOptions
) => ({ ...options, ...context }) as TContext & TOptions;

const resolveFactoryValue = <TInput, TValue>(
  value: FactoryValue<TInput, TValue> | undefined,
  input: TInput
) => {
  if (typeof value === 'function') {
    return (value as (input: TInput) => TValue)(input);
  }

  return value;
};

export function createRuleFactory<
  TRequired extends object = {},
  TDefaults extends object = {},
  TMatch = unknown,
  TConfig extends AnyRuleFactoryConfig<
    TDefaults,
    TRequired,
    TMatch
  > = AnyRuleFactoryConfig<TDefaults, TRequired, TMatch>,
>(
  config: TConfig & TDefaults
): CreateRuleFactoryReturn<
  ContextFromFactoryConfig<TConfig>,
  TDefaults,
  TRequired
>;
export function createRuleFactory<
  TRequired extends object = {},
  TDefaults extends object = {},
>(
  configBuilder: RuleFactoryConfigBuilder<
    | SelectionInputRuleContext
    | InsertTextInputRuleContext
    | InsertBreakInputRuleContext
    | InsertDataInputRuleContext,
    TDefaults,
    TRequired,
    AnyRuleFactoryConfigLoose<TDefaults, TRequired>
  >
): CreateRuleFactoryReturn<
  | SelectionInputRuleContext
  | InsertTextInputRuleContext
  | InsertBreakInputRuleContext
  | InsertDataInputRuleContext,
  TDefaults,
  TRequired
>;
export function createRuleFactory(
  configOrBuilder:
    | Record<string, unknown>
    | RuleFactoryConfigBuilder<
        Record<string, unknown>,
        Record<string, unknown>,
        Record<string, unknown>,
        AnyRuleFactoryConfigLoose
      >
) {
  return (options: Record<string, unknown> = {}) => {
    const factoryOptions =
      typeof configOrBuilder === 'function'
        ? options
        : { ...(configOrBuilder as Record<string, unknown>), ...options };
    const config =
      typeof configOrBuilder === 'function'
        ? configOrBuilder(options)
        : (configOrBuilder as AnyRuleFactoryConfigLoose);

    const priority =
      typeof options.priority === 'number'
        ? options.priority
        : typeof config.priority === 'number'
          ? config.priority
          : undefined;

    const insertTextEnabled =
      typeof options.enabled === 'function'
        ? (options.enabled as (context: InsertTextInputRuleContext) => boolean)
        : undefined;
    const insertBreakEnabled =
      typeof options.enabled === 'function'
        ? (options.enabled as (context: InsertBreakInputRuleContext) => boolean)
        : undefined;
    const insertDataEnabled =
      typeof options.enabled === 'function'
        ? (options.enabled as (context: InsertDataInputRuleContext) => boolean)
        : undefined;
    const selectionEnabled =
      typeof options.enabled === 'function'
        ? (options.enabled as (context: SelectionInputRuleContext) => boolean)
        : undefined;
    const getFactoryInput = <TContext extends object>(context: TContext) =>
      getMergedInput(context, factoryOptions);

    if (config.type === 'mark') {
      const markConfig = config as MarkRuleFactoryConfig<
        Record<string, unknown>,
        Record<string, unknown>
      >;
      return createMarkInputRule({
        enabled: markConfig.enabled
          ? (context) => markConfig.enabled!(getFactoryInput(context))
          : insertTextEnabled,
        end: resolveFactoryValue(
          markConfig.end,
          getFactoryInput({}) as unknown as FactoryInput<
            InsertTextInputRuleContext,
            Record<string, unknown>,
            Record<string, unknown>
          >
        ),
        mark: resolveFactoryValue(
          markConfig.mark,
          getFactoryInput({}) as unknown as FactoryInput<
            InsertTextInputRuleContext,
            Record<string, unknown>,
            Record<string, unknown>
          >
        ),
        marks: resolveFactoryValue(
          markConfig.marks,
          getFactoryInput({}) as unknown as FactoryInput<
            InsertTextInputRuleContext,
            Record<string, unknown>,
            Record<string, unknown>
          >
        ),
        priority,
        start: resolveFactoryValue(
          markConfig.start,
          getFactoryInput({}) as unknown as FactoryInput<
            InsertTextInputRuleContext,
            Record<string, unknown>,
            Record<string, unknown>
          >
        )!,
        trigger: resolveFactoryValue(
          markConfig.trigger,
          getFactoryInput({}) as unknown as FactoryInput<
            InsertTextInputRuleContext,
            Record<string, unknown>,
            Record<string, unknown>
          >
        )!,
        trim: resolveFactoryValue(
          markConfig.trim,
          getFactoryInput({}) as unknown as FactoryInput<
            InsertTextInputRuleContext,
            Record<string, unknown>,
            Record<string, unknown>
          >
        ),
      }) as unknown as AnyInputRule<unknown>;
    }

    if (config.type === 'blockStart') {
      const blockStartConfig = config as BlockStartRuleFactoryConfig<
        Record<string, unknown>,
        Record<string, unknown>,
        {}
      >;
      return createBlockStartInputRule({
        enabled: blockStartConfig.enabled
          ? (context) => blockStartConfig.enabled!(getFactoryInput(context))
          : insertTextEnabled,
        match: (context) =>
          resolveFactoryValue(blockStartConfig.match, getFactoryInput(context)),
        mode: resolveFactoryValue(
          blockStartConfig.mode,
          getFactoryInput({}) as unknown as FactoryInput<
            InsertTextInputRuleContext,
            Record<string, unknown>,
            Record<string, unknown>
          >
        ),
        node: resolveFactoryValue(
          blockStartConfig.node,
          getFactoryInput({}) as unknown as FactoryInput<
            InsertTextInputRuleContext,
            Record<string, unknown>,
            Record<string, unknown>
          >
        ),
        priority,
        removeMatchedText: resolveFactoryValue(
          blockStartConfig.removeMatchedText,
          getFactoryInput({}) as unknown as FactoryInput<
            InsertTextInputRuleContext,
            Record<string, unknown>,
            Record<string, unknown>
          >
        ),
        resolveMatch: blockStartConfig.resolveMatch
          ? (((args) =>
              blockStartConfig.resolveMatch!(
                args,
                getFactoryInput({}) as unknown as FactoryInput<
                  InsertTextInputRuleContext,
                  Record<string, unknown>,
                  Record<string, unknown>
                >
              )) as BlockStartInputRuleConfig['resolveMatch'])
          : undefined,
        apply: blockStartConfig.apply
          ? (context, match) =>
              blockStartConfig.apply!(getFactoryInput(context), match)
          : undefined,
        trigger: resolveFactoryValue(
          blockStartConfig.trigger,
          getFactoryInput({}) as unknown as FactoryInput<
            InsertTextInputRuleContext,
            Record<string, unknown>,
            Record<string, unknown>
          >
        )!,
      }) as unknown as AnyInputRule<unknown>;
    }

    if (config.type === 'blockFence') {
      const blockFenceConfig = config as BlockFenceRuleFactoryConfig<
        Record<string, unknown>,
        Record<string, unknown>,
        unknown
      >;
      return createBlockFenceInputRule({
        apply: (context, match) =>
          blockFenceConfig.apply(getFactoryInput(context), match),
        block: resolveFactoryValue(
          blockFenceConfig.block,
          getFactoryInput({}) as unknown as FactoryInput<
            SelectionInputRuleContext,
            Record<string, unknown>,
            Record<string, unknown>
          >
        ),
        enabled: blockFenceConfig.enabled
          ? (context) => blockFenceConfig.enabled!(getFactoryInput(context))
          : selectionEnabled,
        fence: resolveFactoryValue(
          blockFenceConfig.fence,
          getFactoryInput({}) as unknown as FactoryInput<
            SelectionInputRuleContext,
            Record<string, unknown>,
            Record<string, unknown>
          >
        )!,
        on: resolveFactoryValue(
          blockFenceConfig.on ??
            (options.on as BlockFenceInputRuleConfig['on'] | undefined),
          getFactoryInput({}) as unknown as FactoryInput<
            SelectionInputRuleContext,
            Record<string, unknown>,
            Record<string, unknown>
          >
        )!,
        priority,
        resolveMatch: blockFenceConfig.resolveMatch
          ? (((args) =>
              blockFenceConfig.resolveMatch!(
                args,
                getFactoryInput({}) as unknown as FactoryInput<
                  SelectionInputRuleContext,
                  Record<string, unknown>,
                  Record<string, unknown>
                >
              )) as BlockFenceInputRuleConfig['resolveMatch'])
          : undefined,
      }) as unknown as AnyInputRule<unknown>;
    }

    if (config.type === 'insertText') {
      const insertTextConfig = config as InsertTextRuleFactoryConfig<
        Record<string, unknown>,
        Record<string, unknown>,
        unknown
      >;
      return defineInputRule({
        apply: (context, match) =>
          insertTextConfig.apply(getFactoryInput(context), match),
        enabled: insertTextConfig.enabled
          ? (context) => insertTextConfig.enabled!(getFactoryInput(context))
          : insertTextEnabled,
        priority,
        resolve: insertTextConfig.resolve
          ? (context) => insertTextConfig.resolve!(getFactoryInput(context))
          : undefined,
        target: 'insertText',
        trigger: resolveFactoryValue(
          insertTextConfig.trigger,
          getFactoryInput({}) as unknown as FactoryInput<
            InsertTextInputRuleContext,
            Record<string, unknown>,
            Record<string, unknown>
          >
        )!,
      } as InsertTextInputRule<unknown>) as unknown as AnyInputRule<unknown>;
    }

    if (config.type === 'insertBreak') {
      const insertBreakConfig = config as InsertBreakRuleFactoryConfig<
        Record<string, unknown>,
        Record<string, unknown>,
        unknown
      >;
      return defineInputRule({
        apply: (context, match) =>
          insertBreakConfig.apply(getFactoryInput(context), match),
        enabled: insertBreakConfig.enabled
          ? (context) => insertBreakConfig.enabled!(getFactoryInput(context))
          : insertBreakEnabled,
        priority,
        resolve: insertBreakConfig.resolve
          ? (context) => insertBreakConfig.resolve!(getFactoryInput(context))
          : undefined,
        target: 'insertBreak',
      } as InsertBreakInputRule<unknown>) as unknown as AnyInputRule<unknown>;
    }

    if (config.type === 'insertData') {
      const insertDataConfig = config as InsertDataRuleFactoryConfig<
        Record<string, unknown>,
        Record<string, unknown>,
        unknown
      >;
      return defineInputRule({
        apply: (context, match) =>
          insertDataConfig.apply(getFactoryInput(context), match),
        enabled: insertDataConfig.enabled
          ? (context) => insertDataConfig.enabled!(getFactoryInput(context))
          : insertDataEnabled,
        mimeTypes: resolveFactoryValue(
          insertDataConfig.mimeTypes,
          getFactoryInput({}) as unknown as FactoryInput<
            InsertDataInputRuleContext,
            Record<string, unknown>,
            Record<string, unknown>
          >
        ),
        priority,
        resolve: insertDataConfig.resolve
          ? (context) => insertDataConfig.resolve!(getFactoryInput(context))
          : undefined,
        target: 'insertData',
      } as InsertDataInputRule<unknown>) as unknown as AnyInputRule<unknown>;
    }

    const textSubstitutionConfig = config as TextSubstitutionRuleFactoryConfig<
      Record<string, unknown>,
      Record<string, unknown>
    >;
    return createTextSubstitutionInputRule({
      enabled: textSubstitutionConfig.enabled
        ? (context) => textSubstitutionConfig.enabled!(getFactoryInput(context))
        : insertTextEnabled,
      patterns: resolveFactoryValue(
        textSubstitutionConfig.patterns,
        getFactoryInput({}) as unknown as FactoryInput<
          InsertTextInputRuleContext,
          Record<string, unknown>,
          Record<string, unknown>
        >
      )!,
      priority,
    }) as unknown as AnyInputRule<unknown>;
  };
}
