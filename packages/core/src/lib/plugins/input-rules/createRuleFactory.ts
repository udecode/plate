import type { Point, Value } from '@platejs/plite';

import type { BaseEditor } from '../../editor';
import type { InferConfig } from '../../plugin/BasePlugin';
import type { AnyPluginConfig } from '../../plugin/PluginConfig';
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
  TextSubstitutionMatch,
  TextSubstitutionInputRuleConfig,
  TransformInputRuleContext,
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

type FactoryOptions<
  TDefaults extends object,
  TRequired extends object,
> = TDefaults & TRequired;

type PublicOptions<
  TContext,
  TDefaults extends object,
  TRequired extends object,
> = Simplify<Partial<TDefaults> & TRequired & RuntimeOptions<TContext>>;

type CreateRuleFactoryReturn<
  TConfig,
  TEditor,
  TDefaults extends object,
  TRequired extends object,
> = keyof TRequired extends never
  ? (
      options?: PublicOptions<
        ContextFromFactoryConfig<TConfig, TEditor>,
        TDefaults,
        TRequired
      >
    ) => RuleFromFactoryConfig<TConfig, TEditor>
  : (
      options: PublicOptions<
        ContextFromFactoryConfig<TConfig, TEditor>,
        TDefaults,
        TRequired
      >
    ) => RuleFromFactoryConfig<TConfig, TEditor>;

type MarkRuleFactoryConfig<
  TDefaults extends object,
  TRequired extends object,
  TEditor = BaseEditor,
> = {
  type: 'mark';
  end?: FactoryValue<FactoryOptions<TDefaults, TRequired>, string | undefined>;
  mark?: FactoryValue<FactoryOptions<TDefaults, TRequired>, string | undefined>;
  marks?: FactoryValue<
    FactoryOptions<TDefaults, TRequired>,
    string[] | undefined
  >;
  start: FactoryValue<FactoryOptions<TDefaults, TRequired>, string>;
  trim?: FactoryValue<
    FactoryOptions<TDefaults, TRequired>,
    MarkInputRuleConfig['trim']
  >;
  trigger: FactoryValue<FactoryOptions<TDefaults, TRequired>, string>;
  value?: FactoryValue<
    FactoryOptions<TDefaults, TRequired>,
    MarkInputRuleConfig['value']
  >;
  enabled?: (
    input: FactoryInput<
      InsertTextInputRuleContext<TEditor>,
      TDefaults,
      TRequired
    >
  ) => boolean;
  priority?: number;
};

type BlockStartRuleFactoryConfig<
  TDefaults extends object,
  TRequired extends object,
  TMatch extends object = {},
  TEditor = BaseEditor,
> = {
  type: 'blockStart';
  apply?: BivariantCallback<
    (
      input: FactoryInput<
        InsertTextInputRuleContext<TEditor>,
        TDefaults,
        TRequired
      >,
      match: BlockStartInputRuleMatch & TMatch
    ) => boolean | void
  >;
  match: FactoryValue<
    FactoryInput<InsertTextInputRuleContext<TEditor>, TDefaults, TRequired>,
    RegExp | string | undefined
  >;
  mode?: FactoryValue<
    FactoryOptions<TDefaults, TRequired>,
    BlockStartInputRuleConfig<TMatch>['mode']
  >;
  node?: FactoryValue<FactoryOptions<TDefaults, TRequired>, string | undefined>;
  removeMatchedText?: FactoryValue<
    FactoryOptions<TDefaults, TRequired>,
    boolean | undefined
  >;
  resolveMatch?: (
    args: {
      match: RegExpMatchArray | string;
      range: BlockStartInputRuleMatch['range'];
      text: string;
    },
    input: FactoryOptions<TDefaults, TRequired>
  ) => TMatch | undefined;
  trigger: FactoryValue<FactoryOptions<TDefaults, TRequired>, string>;
  enabled?: (
    input: FactoryInput<
      InsertTextInputRuleContext<TEditor>,
      TDefaults,
      TRequired
    >
  ) => boolean;
  priority?: number;
};

type BlockFenceRuleFactoryConfig<
  TDefaults extends object,
  TRequired extends object,
  TMatch,
  TEditor = BaseEditor,
> = {
  type: 'blockFence';
  apply: BivariantCallback<
    (
      input: FactoryInput<
        SelectionInputRuleContext<TEditor> & TransformInputRuleContext<TEditor>,
        TDefaults,
        TRequired
      >,
      match: TMatch
    ) => boolean | void
  >;
  block?: FactoryValue<
    FactoryOptions<TDefaults, TRequired>,
    string | undefined
  >;
  fence: FactoryValue<FactoryOptions<TDefaults, TRequired>, string>;
  on?: FactoryValue<
    FactoryOptions<TDefaults, TRequired>,
    BlockFenceInputRuleConfig<TMatch>['on']
  >;
  resolveMatch?: (
    args: {
      fence: string;
      path: BlockFenceInputRuleMatch['path'];
      range: BlockFenceInputRuleMatch['range'];
      text: string;
    },
    input: FactoryOptions<TDefaults, TRequired>
  ) => TMatch | undefined;
  enabled?: (
    input: FactoryInput<
      SelectionInputRuleContext<TEditor> & TransformInputRuleContext<TEditor>,
      TDefaults,
      TRequired
    >
  ) => boolean;
  priority?: number;
};

type InsertTextRuleFactoryConfig<
  TDefaults extends object,
  TRequired extends object,
  TMatch,
  TEditor = BaseEditor,
> = {
  type: 'insertText';
  apply: BivariantCallback<
    (
      input: FactoryInput<
        InsertTextInputRuleContext<TEditor>,
        TDefaults,
        TRequired
      >,
      match: TMatch
    ) => boolean | void
  >;
  resolve?: (
    input: FactoryInput<
      InsertTextInputRuleContext<TEditor>,
      TDefaults,
      TRequired
    >
  ) => TMatch | undefined;
  trigger: FactoryValue<
    FactoryOptions<TDefaults, TRequired>,
    InsertTextInputRule<TMatch>['trigger']
  >;
  enabled?: (
    input: FactoryInput<
      InsertTextInputRuleContext<TEditor>,
      TDefaults,
      TRequired
    >
  ) => boolean;
  priority?: number;
};

type InsertBreakRuleFactoryConfig<
  TDefaults extends object,
  TRequired extends object,
  TMatch,
  TEditor = BaseEditor,
> = {
  type: 'insertBreak';
  apply: BivariantCallback<
    (
      input: FactoryInput<
        InsertBreakInputRuleContext<TEditor>,
        TDefaults,
        TRequired
      >,
      match: TMatch
    ) => boolean | void
  >;
  resolve?: (
    input: FactoryInput<
      InsertBreakInputRuleContext<TEditor>,
      TDefaults,
      TRequired
    >
  ) => TMatch | undefined;
  enabled?: (
    input: FactoryInput<
      InsertBreakInputRuleContext<TEditor>,
      TDefaults,
      TRequired
    >
  ) => boolean;
  priority?: number;
};

type InsertDataRuleFactoryConfig<
  TDefaults extends object,
  TRequired extends object,
  TMatch,
  TEditor = BaseEditor,
> = {
  type: 'insertData';
  apply: BivariantCallback<
    (
      input: FactoryInput<
        InsertDataInputRuleContext<TEditor>,
        TDefaults,
        TRequired
      >,
      match: TMatch
    ) => boolean | void
  >;
  mimeTypes?: FactoryValue<
    FactoryOptions<TDefaults, TRequired>,
    string[] | undefined
  >;
  resolve?: (
    input: FactoryInput<
      InsertDataInputRuleContext<TEditor>,
      TDefaults,
      TRequired
    >
  ) => TMatch | undefined;
  enabled?: (
    input: FactoryInput<
      InsertDataInputRuleContext<TEditor>,
      TDefaults,
      TRequired
    >
  ) => boolean;
  priority?: number;
};

type TextSubstitutionRuleFactoryConfig<
  TDefaults extends object,
  TRequired extends object,
  TEditor = BaseEditor,
> = {
  type: 'textSubstitution';
  patterns: FactoryValue<
    FactoryOptions<TDefaults, TRequired>,
    TextSubstitutionInputRuleConfig['patterns']
  >;
  enabled?: (
    input: FactoryInput<
      InsertTextInputRuleContext<TEditor>,
      TDefaults,
      TRequired
    >
  ) => boolean;
  priority?: number;
};

type AnyRuleFactoryConfigLoose<
  TDefaults extends object = Record<string, unknown>,
  TRequired extends object = Record<string, unknown>,
  TEditor = BaseEditor,
> =
  | MarkRuleFactoryConfig<TDefaults, TRequired, TEditor>
  | BlockStartRuleFactoryConfig<TDefaults, TRequired, {}, TEditor>
  | BlockFenceRuleFactoryConfig<TDefaults, TRequired, unknown, TEditor>
  | InsertTextRuleFactoryConfig<TDefaults, TRequired, unknown, TEditor>
  | InsertBreakRuleFactoryConfig<TDefaults, TRequired, unknown, TEditor>
  | InsertDataRuleFactoryConfig<TDefaults, TRequired, unknown, TEditor>
  | TextSubstitutionRuleFactoryConfig<TDefaults, TRequired, TEditor>;

type ContextFromFactoryConfig<TConfig, TEditor> = TConfig extends {
  type: 'blockStart' | 'insertText' | 'mark' | 'textSubstitution';
}
  ? InsertTextInputRuleContext<TEditor>
  : TConfig extends { type: 'blockFence' }
    ? SelectionInputRuleContext<TEditor> & TransformInputRuleContext<TEditor>
    : TConfig extends { type: 'insertBreak' }
      ? InsertBreakInputRuleContext<TEditor>
      : InsertDataInputRuleContext<TEditor>;

type MarkInputRuleMatch = {
  afterStartMatchPoint: Point;
  beforeEndMatchPoint: Point;
  beforeStartMatchPoint: Point;
  end: string | undefined;
};

type RuleFromFactoryConfig<TConfig, TEditor> =
  TConfig extends MarkRuleFactoryConfig<
    infer _TDefaults,
    infer _TRequired,
    infer _TEditor
  >
    ? InsertTextInputRule<MarkInputRuleMatch, TEditor>
    : TConfig extends BlockStartRuleFactoryConfig<
          infer _TDefaults,
          infer _TRequired,
          infer TMatch,
          infer _TEditor
        >
      ? InsertTextInputRule<BlockStartInputRuleMatch & TMatch, TEditor>
      : TConfig extends BlockFenceRuleFactoryConfig<
            infer _TDefaults,
            infer _TRequired,
            infer TMatch,
            infer _TEditor
          >
        ? AnyInputRule<TMatch, TEditor>
        : TConfig extends InsertTextRuleFactoryConfig<
              infer _TDefaults,
              infer _TRequired,
              infer TMatch,
              infer _TEditor
            >
          ? InsertTextInputRule<TMatch, TEditor>
          : TConfig extends InsertBreakRuleFactoryConfig<
                infer _TDefaults,
                infer _TRequired,
                infer TMatch,
                infer _TEditor
              >
            ? InsertBreakInputRule<TMatch, TEditor>
            : TConfig extends InsertDataRuleFactoryConfig<
                  infer _TDefaults,
                  infer _TRequired,
                  infer TMatch,
                  infer _TEditor
                >
              ? InsertDataInputRule<TMatch, TEditor>
              : InsertTextInputRule<TextSubstitutionMatch, TEditor>;

type RuleFactoryOwner = {
  readonly __config: AnyPluginConfig;
  key: string;
};

type BoundRuleFactory<TEditor> = {
  <TRequired extends object = {}, TDefaults extends object = {}>(
    config: MarkRuleFactoryConfig<TDefaults, TRequired, TEditor> & TDefaults
  ): CreateRuleFactoryReturn<
    MarkRuleFactoryConfig<TDefaults, TRequired, TEditor>,
    TEditor,
    TDefaults,
    TRequired
  >;
  <
    TRequired extends object = {},
    TDefaults extends object = {},
    TMatch extends object = {},
  >(
    config: BlockStartRuleFactoryConfig<TDefaults, TRequired, TMatch, TEditor> &
      TDefaults
  ): CreateRuleFactoryReturn<
    BlockStartRuleFactoryConfig<TDefaults, TRequired, TMatch, TEditor>,
    TEditor,
    TDefaults,
    TRequired
  >;
  <
    TRequired extends object = {},
    TDefaults extends object = {},
    TMatch = BlockFenceInputRuleMatch,
  >(
    config: BlockFenceRuleFactoryConfig<TDefaults, TRequired, TMatch, TEditor> &
      TDefaults
  ): CreateRuleFactoryReturn<
    BlockFenceRuleFactoryConfig<TDefaults, TRequired, TMatch, TEditor>,
    TEditor,
    TDefaults,
    TRequired
  >;
  <TRequired extends object = {}, TDefaults extends object = {}, TMatch = true>(
    config: InsertTextRuleFactoryConfig<TDefaults, TRequired, TMatch, TEditor> &
      TDefaults
  ): CreateRuleFactoryReturn<
    InsertTextRuleFactoryConfig<TDefaults, TRequired, TMatch, TEditor>,
    TEditor,
    TDefaults,
    TRequired
  >;
  <TRequired extends object = {}, TDefaults extends object = {}, TMatch = true>(
    config: InsertBreakRuleFactoryConfig<
      TDefaults,
      TRequired,
      TMatch,
      TEditor
    > &
      TDefaults
  ): CreateRuleFactoryReturn<
    InsertBreakRuleFactoryConfig<TDefaults, TRequired, TMatch, TEditor>,
    TEditor,
    TDefaults,
    TRequired
  >;
  <TRequired extends object = {}, TDefaults extends object = {}, TMatch = true>(
    config: InsertDataRuleFactoryConfig<TDefaults, TRequired, TMatch, TEditor> &
      TDefaults
  ): CreateRuleFactoryReturn<
    InsertDataRuleFactoryConfig<TDefaults, TRequired, TMatch, TEditor>,
    TEditor,
    TDefaults,
    TRequired
  >;
  <TRequired extends object = {}, TDefaults extends object = {}>(
    config: TextSubstitutionRuleFactoryConfig<TDefaults, TRequired, TEditor> &
      TDefaults
  ): CreateRuleFactoryReturn<
    TextSubstitutionRuleFactoryConfig<TDefaults, TRequired, TEditor>,
    TEditor,
    TDefaults,
    TRequired
  >;
};

const getMergedInput = <TContext extends object, TOptions extends object>(
  context: TContext,
  options: TOptions
) => ({ ...options, ...context });

function resolveFactoryValue<TInput, TValue>(
  value: FactoryValue<TInput, TValue>,
  input: TInput
): TValue;
function resolveFactoryValue<TInput, TValue>(
  value: FactoryValue<TInput, TValue> | undefined,
  input: TInput
): TValue | undefined;
function resolveFactoryValue<TInput, TValue>(
  value: FactoryValue<TInput, TValue> | undefined,
  input: TInput
) {
  if (typeof value === 'function') {
    return (value as (input: TInput) => TValue)(input);
  }

  return value;
}

function assertRuleFactoryConfig(
  value: unknown
): asserts value is AnyRuleFactoryConfigLoose {
  if (!value || typeof value !== 'object') {
    throw new Error('createRuleFactory must resolve to a rule object.');
  }

  const type = Reflect.get(value, 'type');

  if (
    type !== 'mark' &&
    type !== 'blockStart' &&
    type !== 'blockFence' &&
    type !== 'insertText' &&
    type !== 'insertBreak' &&
    type !== 'insertData' &&
    type !== 'textSubstitution'
  ) {
    throw new Error(
      `createRuleFactory received an unknown rule type: ${String(type)}`
    );
  }
}

export function createRuleFactory<P extends RuleFactoryOwner>(
  plugin: P
): BoundRuleFactory<BaseEditor<Value, InferConfig<P>>>;
export function createRuleFactory<
  TRequired extends object = {},
  TDefaults extends object = {},
>(
  config: MarkRuleFactoryConfig<TDefaults, TRequired> & TDefaults
): CreateRuleFactoryReturn<
  MarkRuleFactoryConfig<TDefaults, TRequired>,
  BaseEditor,
  TDefaults,
  TRequired
>;
export function createRuleFactory<
  TRequired extends object = {},
  TDefaults extends object = {},
  TMatch extends object = {},
>(
  config: BlockStartRuleFactoryConfig<TDefaults, TRequired, TMatch> & TDefaults
): CreateRuleFactoryReturn<
  BlockStartRuleFactoryConfig<TDefaults, TRequired, TMatch>,
  BaseEditor,
  TDefaults,
  TRequired
>;
export function createRuleFactory<
  TRequired extends object = {},
  TDefaults extends object = {},
  TMatch = BlockFenceInputRuleMatch,
>(
  config: BlockFenceRuleFactoryConfig<TDefaults, TRequired, TMatch> & TDefaults
): CreateRuleFactoryReturn<
  BlockFenceRuleFactoryConfig<TDefaults, TRequired, TMatch>,
  BaseEditor,
  TDefaults,
  TRequired
>;
export function createRuleFactory<
  TRequired extends object = {},
  TDefaults extends object = {},
  TMatch = true,
>(
  config: InsertTextRuleFactoryConfig<TDefaults, TRequired, TMatch> & TDefaults
): CreateRuleFactoryReturn<
  InsertTextRuleFactoryConfig<TDefaults, TRequired, TMatch>,
  BaseEditor,
  TDefaults,
  TRequired
>;
export function createRuleFactory<
  TRequired extends object = {},
  TDefaults extends object = {},
  TMatch = true,
>(
  config: InsertBreakRuleFactoryConfig<TDefaults, TRequired, TMatch> & TDefaults
): CreateRuleFactoryReturn<
  InsertBreakRuleFactoryConfig<TDefaults, TRequired, TMatch>,
  BaseEditor,
  TDefaults,
  TRequired
>;
export function createRuleFactory<
  TRequired extends object = {},
  TDefaults extends object = {},
  TMatch = true,
>(
  config: InsertDataRuleFactoryConfig<TDefaults, TRequired, TMatch> & TDefaults
): CreateRuleFactoryReturn<
  InsertDataRuleFactoryConfig<TDefaults, TRequired, TMatch>,
  BaseEditor,
  TDefaults,
  TRequired
>;
export function createRuleFactory<
  TRequired extends object = {},
  TDefaults extends object = {},
>(
  config: TextSubstitutionRuleFactoryConfig<TDefaults, TRequired> & TDefaults
): CreateRuleFactoryReturn<
  TextSubstitutionRuleFactoryConfig<TDefaults, TRequired>,
  BaseEditor,
  TDefaults,
  TRequired
>;
export function createRuleFactory(configOrBuilder: unknown): unknown {
  if (
    typeof configOrBuilder === 'object' &&
    configOrBuilder !== null &&
    typeof Reflect.get(configOrBuilder, 'configure') === 'function' &&
    Array.isArray(Reflect.get(configOrBuilder, '__configurationLayers'))
  ) {
    return createRuleFactory;
  }

  return (options: Record<string, unknown> = {}) => {
    if (!configOrBuilder || typeof configOrBuilder !== 'object') {
      throw new Error('createRuleFactory requires a rule object.');
    }
    const config = configOrBuilder;
    const factoryOptions = { ...configOrBuilder, ...options };

    assertRuleFactoryConfig(config);

    const priority =
      typeof options.priority === 'number'
        ? options.priority
        : typeof config.priority === 'number'
          ? config.priority
          : undefined;
    const optionEnabled = options.enabled;
    const optionOn =
      options.on === 'break' || options.on === 'match' ? options.on : undefined;
    const getFactoryInput = <TContext extends object>(context: TContext) =>
      getMergedInput(context, factoryOptions);

    if (config.type === 'mark') {
      const enabled = config.enabled;

      return createMarkInputRule({
        enabled: enabled
          ? (context) => enabled(getFactoryInput(context))
          : typeof optionEnabled === 'function'
            ? (context) => optionEnabled(getFactoryInput(context))
            : undefined,
        end: resolveFactoryValue(config.end, factoryOptions),
        mark: resolveFactoryValue(config.mark, factoryOptions),
        marks: resolveFactoryValue(config.marks, factoryOptions),
        priority,
        start: resolveFactoryValue(config.start, factoryOptions),
        trigger: resolveFactoryValue(config.trigger, factoryOptions),
        value: resolveFactoryValue(config.value, factoryOptions),
        trim: resolveFactoryValue(config.trim, factoryOptions),
      });
    }

    if (config.type === 'blockStart') {
      const apply = config.apply;
      const enabled = config.enabled;
      const resolveMatch = config.resolveMatch;

      return createBlockStartInputRule({
        enabled: enabled
          ? (context) => enabled(getFactoryInput(context))
          : typeof optionEnabled === 'function'
            ? (context) => optionEnabled(getFactoryInput(context))
            : undefined,
        match: (context) =>
          resolveFactoryValue(config.match, getFactoryInput(context)),
        mode: resolveFactoryValue(config.mode, factoryOptions),
        node: resolveFactoryValue(config.node, factoryOptions),
        priority,
        removeMatchedText: resolveFactoryValue(
          config.removeMatchedText,
          factoryOptions
        ),
        resolveMatch: resolveMatch
          ? (args) => resolveMatch(args, factoryOptions)
          : undefined,
        apply: apply
          ? (context, match) => apply(getFactoryInput(context), match)
          : undefined,
        trigger: resolveFactoryValue(config.trigger, factoryOptions),
      });
    }

    if (config.type === 'blockFence') {
      const enabled = config.enabled;
      const resolveMatch = config.resolveMatch;
      const on =
        resolveFactoryValue(config.on ?? optionOn, factoryOptions) ?? 'match';

      return createBlockFenceInputRule<unknown>({
        apply: (context, match) =>
          config.apply(getFactoryInput(context), match),
        block: resolveFactoryValue(config.block, factoryOptions),
        enabled: enabled
          ? (context) => enabled(getFactoryInput(context))
          : typeof optionEnabled === 'function'
            ? (context) => optionEnabled(getFactoryInput(context))
            : undefined,
        fence: resolveFactoryValue(config.fence, factoryOptions),
        on,
        priority,
        resolveMatch: resolveMatch
          ? (args) => resolveMatch(args, factoryOptions)
          : undefined,
      });
    }

    if (config.type === 'insertText') {
      const enabled = config.enabled;
      const resolve = config.resolve;

      return defineInputRule<unknown>({
        apply: (context, match) =>
          config.apply(getFactoryInput(context), match),
        enabled: enabled
          ? (context) => enabled(getFactoryInput(context))
          : typeof optionEnabled === 'function'
            ? (context) => optionEnabled(getFactoryInput(context))
            : undefined,
        priority,
        resolve: resolve
          ? (context) => resolve(getFactoryInput(context))
          : undefined,
        target: 'insertText',
        trigger: resolveFactoryValue(config.trigger, factoryOptions),
      });
    }

    if (config.type === 'insertBreak') {
      const enabled = config.enabled;
      const resolve = config.resolve;

      return defineInputRule<unknown>({
        apply: (context, match) =>
          config.apply(getFactoryInput(context), match),
        enabled: enabled
          ? (context) => enabled(getFactoryInput(context))
          : typeof optionEnabled === 'function'
            ? (context) => optionEnabled(getFactoryInput(context))
            : undefined,
        priority,
        resolve: resolve
          ? (context) => resolve(getFactoryInput(context))
          : undefined,
        target: 'insertBreak',
      });
    }

    if (config.type === 'insertData') {
      const enabled = config.enabled;
      const resolve = config.resolve;

      return defineInputRule<unknown>({
        apply: (context, match) =>
          config.apply(getFactoryInput(context), match),
        enabled: enabled
          ? (context) => enabled(getFactoryInput(context))
          : typeof optionEnabled === 'function'
            ? (context) => optionEnabled(getFactoryInput(context))
            : undefined,
        mimeTypes: resolveFactoryValue(config.mimeTypes, factoryOptions),
        priority,
        resolve: resolve
          ? (context) => resolve(getFactoryInput(context))
          : undefined,
        target: 'insertData',
      });
    }

    const enabled = config.enabled;

    return createTextSubstitutionInputRule({
      enabled: enabled
        ? (context) => enabled(getFactoryInput(context))
        : typeof optionEnabled === 'function'
          ? (context) => optionEnabled(getFactoryInput(context))
          : undefined,
      patterns: resolveFactoryValue(config.patterns, factoryOptions),
      priority,
    });
  };
}
