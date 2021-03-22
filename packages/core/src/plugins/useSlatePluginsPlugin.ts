import { ReactNode } from 'react';
import { Editor } from 'slate';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { WithOverride } from '../types/SlatePlugin/WithOverride';
import { SlatePluginsOptions } from '../types/SlatePluginOptions/SlatePluginsOptions';
import { getSlatePluginWithOverrides } from '../utils/getSlatePluginWithOverrides';
import { pipe } from '../utils/pipe';
import { withInlineVoid } from './useInlineVoidPlugin';

export interface SlatePluginsEditor extends Editor {
  key: any;
  id: string;
  options: SlatePluginsOptions;
}

export interface WithSlatePluginsOptions {
  id?: string;
  plugins?: SlatePlugin[];
  options?: SlatePluginsOptions;
  components?: Record<string, ReactNode>;
}

/**
 * Apply `withInlineVoid` and all slate plugins `withOverrides`.
 * Overrides:
 * - `id`: id of the editor.
 * - `key`: random key for the <Slate> component so each time the editor is created, the component resets.
 * - `options`: {@link SlatePluginsOptions}
 */
export const withSlatePlugins = <TOutput = {}>({
  id = 'main',
  plugins = [],
  options = {},
  components = {},
}: WithSlatePluginsOptions = {}): WithOverride<
  Editor,
  SlatePluginsEditor & TOutput
> => (e) => {
  let editor = e as typeof e & SlatePluginsEditor & TOutput;
  editor.id = id;

  if (components) {
    // Merge components into options
    Object.keys(components).forEach((key) => {
      options[key] = {
        component: components[key],
        ...options[key],
      };
    });
  }

  // Default option type is the plugin key
  Object.keys(options).forEach((key) => {
    if (options[key].type === undefined) options[key].type = key;
  });
  editor.options = options;

  if (!editor.key) {
    editor.key = Math.random();
  }

  // Plugins inline and void types
  editor = pipe(editor, withInlineVoid({ plugins }));

  // Plugins withOverrides
  const withOverrides = plugins?.flatMap((p) => p.withOverrides ?? []) ?? [];
  editor = pipe(editor, ...withOverrides);

  return editor;
};

/**
 * @see {@link withSlatePlugins}
 */
export const useSlatePluginsPlugin = getSlatePluginWithOverrides(
  withSlatePlugins
);
