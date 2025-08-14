import { type PluginConfig, createTSlatePlugin, KEYS, RangeApi } from 'platejs';

import type { AutoformatRule, AutoformatTextRule } from './types';

import { autoformatBlock, autoformatMark, autoformatText } from './transforms';

export type AutoformatConfig = PluginConfig<
  'autoformat',
  {
    /** Internal: Rules indexed by trigger character for performance */
    _indexedRules?: Map<string, AutoformatRule[]>;
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
    _indexedRules: undefined,
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

              return;
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

          const opts = getOptions();

          // Initialize indexed rules on first use for performance
          if (!opts._indexedRules && opts.rules) {
            const indexedRules = new Map<string, AutoformatRule[]>();

            for (const rule of opts.rules) {
              // Get trigger characters for this rule
              const triggers: string[] = [];

              if (rule.trigger) {
                const triggerArray = Array.isArray(rule.trigger)
                  ? rule.trigger
                  : [rule.trigger];
                triggers.push(...triggerArray);
              } else {
                // Default trigger is the last character of the match
                const match = rule.match;
                if (typeof match === 'string') {
                  triggers.push(match.at(-1));
                } else if (Array.isArray(match)) {
                  for (const m of match) {
                    if (typeof m === 'string') {
                      triggers.push(m.at(-1));
                    } else if (m.end) {
                      triggers.push(m.end.at(-1));
                    }
                  }
                } else if ((match as any).end) {
                  triggers.push(
                    (match as any).end[(match as any).end.length - 1]
                  );
                }
              }

              // Index this rule by each of its trigger characters
              for (const trigger of triggers) {
                if (!indexedRules.has(trigger)) {
                  indexedRules.set(trigger, []);
                }
                indexedRules.get(trigger)!.push(rule);
              }
            }

            opts._indexedRules = indexedRules;
          }

          // Only check rules that could be triggered by this character
          const rulesToCheck = opts._indexedRules?.get(text) || [];

          for (const rule of rulesToCheck) {
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
