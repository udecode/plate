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
  id: string;
  plugins?: SlatePlugin[];
  options?: SlatePluginsOptions;
}

/**
 * Apply `withInlineVoid` and all slate plugins `withOverrides`.
 * Overrides:
 * - `id`: id of the editor.
 * - `key`: random key for the <Slate> component so each time the editor is created, the component resets.
 * - `options`: {@link SlatePluginsOptions}
 */
export const withSlatePlugins = ({
  id = 'main',
  plugins = [],
  options = {},
}: WithSlatePluginsOptions): WithOverride<Editor, SlatePluginsEditor> => (
  e
) => {
  let editor = e as typeof e & SlatePluginsEditor;
  editor.id = id;

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
