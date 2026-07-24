import type { EditorCoreStateView } from '@platejs/plite';

import type { BaseEditor } from '../editor';
import type { AnyBasePlugin, BasePlugin } from '../plugin/BasePlugin';
import type {
  AnyPluginConfig,
  HtmlParserOptions,
  HtmlPluginContext,
} from '../plugin/PluginConfig';
import {
  createHtmlPluginContext,
  pipePreparedInsertDataQuery,
  prepareHtmlPlugin,
  prepareHtmlRegistry,
} from '../../internal/plugin/prepareHtmlRegistry';

/** Prepare a pure HTML parser query pipeline for one resolved Plate plugin. */
export function prepareHtmlParserQuery<C extends AnyPluginConfig>(
  editor: BaseEditor,
  plugin: BasePlugin<C>
): (state: EditorCoreStateView, options: HtmlParserOptions) => boolean;
export function prepareHtmlParserQuery(
  editor: BaseEditor,
  plugin: AnyBasePlugin
): (state: EditorCoreStateView, options: HtmlParserOptions) => boolean;
export function prepareHtmlParserQuery(
  editor: BaseEditor,
  plugin: AnyBasePlugin
) {
  const prepared = prepareHtmlPlugin(editor, plugin);

  return (state: EditorCoreStateView, options: HtmlParserOptions) =>
    pipePreparedInsertDataQuery(state, [prepared], options);
}

/** Prepare a plugin's immutable parser context from one resolved editor. */
export function prepareHtmlPluginContext<C extends AnyPluginConfig>(
  editor: BaseEditor,
  plugin: BasePlugin<C>
): (state: EditorCoreStateView) => HtmlPluginContext<C>;
export function prepareHtmlPluginContext(
  editor: BaseEditor,
  plugin: AnyBasePlugin | string
): (state: EditorCoreStateView) => HtmlPluginContext;
export function prepareHtmlPluginContext(
  editor: BaseEditor,
  plugin: AnyBasePlugin | string
) {
  const key = typeof plugin === 'string' ? plugin : plugin.key;
  const registry = prepareHtmlRegistry(editor);
  const prepared =
    typeof plugin === 'string'
      ? registry.plugins.find((candidate) => candidate.key === key)
      : prepareHtmlPlugin(editor, plugin, registry);

  if (!prepared) {
    throw new Error(`Parser plugin "${key}" is not installed.`);
  }

  return (state: EditorCoreStateView) =>
    createHtmlPluginContext(prepared, state);
}

/** Run an imperative API against the same pure HTML parser context. */
export const withHtmlPluginContext = <T>(
  editor: BaseEditor,
  plugin: AnyBasePlugin | string,
  run: (context: HtmlPluginContext) => T
): T => {
  const createContext = prepareHtmlPluginContext(editor, plugin);

  return editor.read((state) => run(createContext(state)));
};
