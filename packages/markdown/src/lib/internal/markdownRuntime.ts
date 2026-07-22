import type { BaseEditor, ParserPluginRegistry } from '@platejs/core';
import {
  getPluginHostPolicyResource,
  prepareParserPluginContext,
} from '@platejs/core';
import type { EditorCoreStateView } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type {
  MarkdownConfig,
  MarkdownPluginConfiguration,
  MarkdownProfileResource,
} from '../MarkdownPlugin';
import type { MdRules } from '../types';

import { defaultRules } from '../rules/defaultRules';

export type MarkdownRuntime = Readonly<{
  config: MarkdownProfileResource;
  registry: ParserPluginRegistry;
  state: EditorCoreStateView;
}>;

export const createMarkdownRuntime = (
  context: Readonly<{
    config: MarkdownPluginConfiguration;
    registry: ParserPluginRegistry;
    state: EditorCoreStateView;
  }>
): MarkdownRuntime =>
  Object.freeze({
    config: getPluginHostPolicyResource(context.config.profile),
    registry: context.registry,
    state: context.state,
  });

export const withMarkdownRuntime = <T>(
  editor: BaseEditor,
  run: (runtime: MarkdownRuntime) => T
): T =>
  editor.read((state) => {
    const plugin = editor.plugin<MarkdownConfig>(KEYS.markdown).plugin;
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
