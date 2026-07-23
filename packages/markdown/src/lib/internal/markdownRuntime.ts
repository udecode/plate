import type {
  BaseEditor,
  ParserPluginContext,
  ParserPluginRegistry,
  PluginConfig,
} from '@platejs/core';
import { prepareParserPluginContext } from '@platejs/core';
import type { EditorCoreStateView } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { MarkdownPluginOptions } from '../MarkdownPlugin';
import type { MdRules, PlateType } from '../types';

import { defaultRules } from '../rules/defaultRules';

type MarkdownRuntimeConfig = PluginConfig<'markdown', MarkdownPluginOptions>;
type ConfiguredMarkdownPluginOptions =
  ParserPluginContext<MarkdownRuntimeConfig>['options'];

type MarkdownRuntimeOptions = Readonly<{
  allowedNodes: readonly PlateType[] | null;
  allowNode?: ConfiguredMarkdownPluginOptions['allowNode'];
  disallowedNodes: readonly PlateType[] | null;
  plainMarks: readonly PlateType[] | null;
  remarkPlugins: NonNullable<ConfiguredMarkdownPluginOptions['remarkPlugins']>;
  remarkStringifyOptions: NonNullable<
    ConfiguredMarkdownPluginOptions['remarkStringifyOptions']
  > | null;
  rules: NonNullable<ConfiguredMarkdownPluginOptions['rules']> | null;
}>;

export type MarkdownRuntime = Readonly<{
  options: MarkdownRuntimeOptions;
  registry: ParserPluginRegistry;
  state: EditorCoreStateView;
}>;

export const createMarkdownRuntime = (
  context: Pick<
    ParserPluginContext<MarkdownRuntimeConfig>,
    'options' | 'registry' | 'state'
  >
): MarkdownRuntime =>
  Object.freeze({
    options: Object.freeze({
      allowedNodes: null,
      disallowedNodes: null,
      plainMarks: null,
      remarkPlugins: [],
      remarkStringifyOptions: null,
      rules: null,
      ...context.options,
    }),
    registry: context.registry,
    state: context.state,
  });

export const withMarkdownRuntime = <T>(
  editor: BaseEditor,
  run: (runtime: MarkdownRuntime) => T
): T =>
  editor.read((state) => {
    const plugin = editor.plugin<MarkdownRuntimeConfig>({
      key: KEYS.markdown,
    }).plugin;
    const createContext = prepareParserPluginContext(editor, plugin);

    return run(createMarkdownRuntime(createContext(state)));
  });

export const buildRulesWithRuntime = (runtime: MarkdownRuntime): MdRules => {
  const rules: MdRules = {};

  Object.entries(defaultRules).forEach(([key, rule]) => {
    rules[runtime.registry.getKey(key) ?? key] = rule;
  });

  return rules;
};
