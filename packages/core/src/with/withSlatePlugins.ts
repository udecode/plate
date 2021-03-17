import { Editor } from 'slate';
import { SlatePluginsOptions } from '../types/SlatePluginsStore';

export interface SlatePluginsEditor {
  key: any;
  options: SlatePluginsOptions;
}

/**
 * Plugin to be paired with the slate-plugins framework.
 * Overrides:
 * - `key`: random key
 * - `options`: empty object that can be used for static plugin options.
 */
export const withSlatePlugins = <T extends Editor>(e: T) => {
  const editor = e as T & SlatePluginsEditor;

  if (!editor.key) {
    editor.key = Math.random();
  }
  if (!editor.options) {
    editor.options = {};
  }

  return editor;
};
