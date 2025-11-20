import { type PluginConfig, createTSlatePlugin, KEYS, RangeApi } from 'platejs';

import type { AutoformatRule, AutoformatTextRule } from './types';

import { autoformatBlock, autoformatMark, autoformatText } from './transforms';

export type AutoformatConfig = PluginConfig<
  'autoformat',
  {
    enableUndoOnDelete?: boolean;
    /** A list of triggering rules. */
    rules?: AutoformatRule[];
  }
>;

/** Enables support for autoformatting actions. */
export const AutoformatPlugin = createTSlatePlugin<AutoformatConfig>({
  key: KEYS.autoformat,
  editOnly: true,
  options: {
    rules: [],
  },
}).overrideEditor(
  ({ editor, getOptions, tf: { deleteBackward, insertText } }) => {
    return {
      transforms: {
        deleteBackward(unit = 'character') {
          const apply = () => {
            const { enableUndoOnDelete, rules } = getOptions();

            if (unit !== 'character' || !rules || !enableUndoOnDelete) return;

            // Abort if selection is not collapsed i.e. we're not deleting single character.
            const { selection } = editor;

            if (!selection || !editor.api.isCollapsed()) return;

            // Get start and end point of selection.
            // For example: Text|
            //                  ^ cursor at the moment of pressing the hotkey
            // start, end will be equal to the location of the |
            const [start, end] = RangeApi.edges(selection);

            // Get location before the cursor.
            // before will be a point one character before | so:
            // Text|
            //    ^
            const before = editor.api.before(end, {
              distance: 1,
              unit: 'character',
            });

            if (!start) return;
            if (!before) return;

            // Abort if there doesn't exist a valid character to replace.
            const charRange = { anchor: before, focus: start };

            if (!charRange) return;

            // Text|
            //    ^
            // Between ^ and | is t
            const char = editor.api.string(charRange);

            if (!char) return;

            const matchers: AutoformatRule[] = [...rules].filter((rule) => {
              const textRule = rule as AutoformatTextRule;

              if (textRule) {
                return textRule.mode === 'text' && textRule.format === char;
              }

              return false;
            });

            // abort if no matching substitution is found.
            if (!matchers || matchers.length === 0) return;

            // remove the shorthand character.
            deleteBackward(unit);

            // put back the orignal characters. This could match to a single string or an array.
            const rule = matchers[0] as AutoformatTextRule;

            if (rule && typeof rule.match === 'string') {
              editor.tf.insertText(rule.match);
            } else {
              const matchArray = rule.match as string[];

              if (matchArray && matchArray.length > 0) {
                editor.tf.insertText(matchArray[0]);
              }
            }

            return true;
          };

          if (apply()) return;

          deleteBackward(unit);
        },
        insertText(text, options) {
          if (!editor.api.isCollapsed()) return insertText(text, options);

          for (const rule of getOptions().rules!) {
            const { insertTrigger, mode = 'text', query } = rule;

            if (query && !query(editor as any, { ...rule, text })) continue;

            const autoformatter: Record<typeof mode, any> = {
              block: autoformatBlock,
              mark: autoformatMark,
              text: autoformatText,
            };

            if (
              autoformatter[mode]?.(editor, {
                ...(rule as any),
                text,
              })
            ) {
              return insertTrigger && insertText(text);
            }
          }

          insertText(text, options);
        },
      },
    };
  }
);
