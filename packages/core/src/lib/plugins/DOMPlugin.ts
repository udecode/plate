import { createSlatePlugin } from '../plugin/createSlatePlugin';

/**
 * Placeholder plugin for DOM interaction, that could be replaced with
 * ReactPlugin.
 */
export const DOMPlugin = createSlatePlugin({
  key: 'dom',
});
