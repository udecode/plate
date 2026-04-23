import { KEYS, createSlatePlugin } from 'platejs';

/**
 * Deprecated compatibility plugin for legacy `@platejs/autoformat` imports.
 *
 * This plugin is intentionally inert. Do not configure new autoformat behavior
 * here. Register explicit `inputRules` on the feature plugin that owns the
 * behavior instead:
 *
 * - `@platejs/basic-nodes`: `HeadingRules`, `BlockquoteRules`, mark rules
 * - `@platejs/code-block`: `CodeBlockRules`
 * - `@platejs/list` / `@platejs/list-classic`: list rule factories
 * - local text substitutions: `createTextSubstitutionInputRule`
 *
 * @deprecated Use feature-owned `inputRules` instead. Remove
 * `AutoformatPlugin` from editor plugin arrays after migrating rules.
 */
export const AutoformatPlugin = createSlatePlugin({
  key: KEYS.autoformat,
});
