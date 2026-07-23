import type { EditorCoreStateView } from '@platejs/plite';

import type { BaseEditor } from '../editor';
import type { AnyBasePlugin, BasePlugin } from '../plugin/BasePlugin';
import type {
  AnyPluginConfig,
  ParserOptions,
  ParserPluginContext,
} from '../plugin/PluginConfig';
import {
  createParserPluginContext,
  pipePreparedInsertDataQuery,
  prepareParserPlugin,
  prepareParserRegistry,
} from '../../internal/plugin/prepareParserRegistry';

/** Prepare a pure parser query pipeline for one resolved Plate plugin. */
export function prepareInsertDataQuery<C extends AnyPluginConfig>(
  editor: BaseEditor,
  plugin: BasePlugin<C>
): (state: EditorCoreStateView, options: ParserOptions) => boolean;
export function prepareInsertDataQuery(
  editor: BaseEditor,
  plugin: AnyBasePlugin
): (state: EditorCoreStateView, options: ParserOptions) => boolean;
export function prepareInsertDataQuery(
  editor: BaseEditor,
  plugin: AnyBasePlugin
) {
  const prepared = prepareParserPlugin(editor, plugin);

  return (state: EditorCoreStateView, options: ParserOptions) =>
    pipePreparedInsertDataQuery(state, prepared.pipeline, options);
}

/** Prepare a plugin's immutable parser context from one resolved editor. */
export function prepareParserPluginContext<C extends AnyPluginConfig>(
  editor: BaseEditor,
  plugin: BasePlugin<C>
): (state: EditorCoreStateView) => ParserPluginContext<C>;
export function prepareParserPluginContext(
  editor: BaseEditor,
  plugin: AnyBasePlugin | string
): (state: EditorCoreStateView) => ParserPluginContext;
export function prepareParserPluginContext(
  editor: BaseEditor,
  plugin: AnyBasePlugin | string
) {
  const key = typeof plugin === 'string' ? plugin : plugin.key;
  const registry = prepareParserRegistry(editor);
  const prepared =
    typeof plugin === 'string'
      ? registry.plugins.find((candidate) => candidate.key === key)
      : prepareParserPlugin(editor, plugin, registry);

  if (!prepared) {
    throw new Error(`Parser plugin "${key}" is not installed.`);
  }

  return (state: EditorCoreStateView) =>
    createParserPluginContext(prepared, state);
}

/** Run an imperative API against the same pure context used by parser ingress. */
export const withParserPluginContext = <T>(
  editor: BaseEditor,
  plugin: AnyBasePlugin | string,
  run: (context: ParserPluginContext) => T
): T => {
  const createContext = prepareParserPluginContext(editor, plugin);

  return editor.read((state) => run(createContext(state)));
};
