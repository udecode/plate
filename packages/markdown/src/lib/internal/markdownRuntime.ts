import type { BaseEditor, PluginConfig } from '@platejs/core';
import { getPluginKey } from '@platejs/core';
import type { EditorCoreStateView } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { MarkdownPluginState } from '../MarkdownPlugin';
import type { MdRules, PlateType } from '../types';

import { defaultRules } from '../rules/defaultRules';

type MarkdownRuntimeConfig = PluginConfig<'markdown', MarkdownPluginState>;
type ConfiguredMarkdownPluginState = Readonly<MarkdownPluginState>;

type MarkdownPluginRegistry = Readonly<{
  getKey: (type: string) => string | undefined;
  getType: (key: string) => string;
  has: (key: string) => boolean;
}>;

type MarkdownRuntimeOptions = Readonly<{
  allowedNodes: readonly PlateType[] | null;
  allowNode?: ConfiguredMarkdownPluginState['allowNode'];
  disallowedNodes: readonly PlateType[] | null;
  plainMarks: readonly PlateType[] | null;
  remarkPlugins: NonNullable<ConfiguredMarkdownPluginState['remarkPlugins']>;
  remarkStringifyOptions: NonNullable<
    ConfiguredMarkdownPluginState['remarkStringifyOptions']
  > | null;
  rules: NonNullable<ConfiguredMarkdownPluginState['rules']> | null;
}>;

export type MarkdownRuntime = Readonly<{
  options: MarkdownRuntimeOptions;
  registry: MarkdownPluginRegistry;
  state: EditorCoreStateView;
}>;

export const createMarkdownRuntime = (
  editor: BaseEditor,
  pluginKey: string,
  state: EditorCoreStateView
): MarkdownRuntime => {
  const options = editor
    .plugin<MarkdownRuntimeConfig>({ key: pluginKey })
    .store.get() as MarkdownPluginState;

  return Object.freeze({
    options: Object.freeze({
      allowedNodes: null,
      disallowedNodes: null,
      plainMarks: null,
      remarkPlugins: [],
      remarkStringifyOptions: null,
      rules: null,
      ...options,
    }),
    registry: Object.freeze({
      getKey: (type: string) => getPluginKey(editor, type),
      getType: (key: string) => editor.getType(key),
      has: (key: string) => {
        try {
          return editor.getPlugin({ key }).key === key;
        } catch {
          return false;
        }
      },
    }),
    state,
  });
};

export const withMarkdownRuntime = <T>(
  editor: BaseEditor,
  run: (runtime: MarkdownRuntime) => T
): T =>
  editor.read((state) => {
    const plugin = editor.plugin<MarkdownRuntimeConfig>({
      key: KEYS.markdown,
    }).plugin;

    return run(createMarkdownRuntime(editor, plugin.key, state));
  });

export const buildRulesWithRuntime = (runtime: MarkdownRuntime): MdRules => {
  const rules: MdRules = {};

  Object.entries(defaultRules).forEach(([key, rule]) => {
    rules[runtime.registry.getKey(key) ?? key] = rule;
  });

  return rules;
};
