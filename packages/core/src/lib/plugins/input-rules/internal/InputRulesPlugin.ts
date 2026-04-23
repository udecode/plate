import { createTSlatePlugin } from '../../../plugin';

import type {
  InsertBreakInputRuleContext,
  InsertDataInputRuleContext,
  InsertTextInputRuleContext,
} from '../types';

const createCachedGetter = <TValue>(compute: () => TValue) => {
  let hasValue = false;
  let value: TValue;

  return () => {
    if (!hasValue) {
      value = compute();
      hasValue = true;
    }

    return value;
  };
};

const createSelectionContext = ({
  editor,
}: {
  editor: InsertTextInputRuleContext['editor'];
}) => {
  const { selection } = editor;
  const isCollapsed = !!selection && editor.api.isCollapsed();
  const getBlockStartRange = createCachedGetter(() => {
    if (!selection) return;

    return editor.api.range('start', selection);
  });
  const getBlockStartText = createCachedGetter(() => {
    const range = getBlockStartRange();

    return range ? editor.api.string(range) : undefined;
  });

  return {
    editor,
    getBlockEntry: createCachedGetter(() => {
      if (!selection) return;

      return editor.api.block({ at: selection });
    }),
    getBlockStartRange,
    getBlockStartText,
    getBlockTextBeforeSelection: createCachedGetter(
      () => getBlockStartText() ?? ''
    ),
    getCharAfter: createCachedGetter(() => {
      if (!selection || !isCollapsed) return;

      const afterPoint = editor.api.after(selection, {
        distance: 1,
        unit: 'character',
      });

      if (!afterPoint) return;

      return (
        editor.api.string({
          anchor: selection.anchor,
          focus: afterPoint,
        }) || undefined
      );
    }),
    getCharBefore: createCachedGetter(() => {
      if (!selection || !isCollapsed) return;

      const beforePoint = editor.api.before(selection, {
        distance: 1,
        unit: 'character',
      });

      if (!beforePoint) return;

      return (
        editor.api.string({
          anchor: beforePoint,
          focus: selection.anchor,
        }) || undefined
      );
    }),
    isCollapsed,
  };
};

const isTriggerMatch = (trigger: readonly string[] | string, text: string) =>
  Array.isArray(trigger) ? trigger.includes(text) : trigger === text;

export const InputRulesPlugin = createTSlatePlugin({
  editOnly: true,
  key: 'inputRules',
}).overrideEditor(
  ({ editor, tf: { insertBreak, insertData, insertText } }) => ({
    transforms: {
      insertBreak() {
        const selectionContext = createSelectionContext({ editor });
        let handled = false;

        for (const rule of editor.meta.inputRules.insertBreak) {
          const context: InsertBreakInputRuleContext = {
            cause: 'insertBreak',
            insertBreak,
            pluginKey: rule.pluginKey,
            ...selectionContext,
          };
          if (rule.enabled?.(context) === false) continue;
          const match = rule.resolve ? rule.resolve(context) : true;

          if (match === undefined) continue;
          if (rule.apply(context, match) !== false) {
            handled = true;

            break;
          }
        }

        if (handled) return;

        insertBreak();
      },
      insertData(data) {
        const text = data.getData('text/plain') || null;
        const selectionContext = createSelectionContext({ editor });
        let handled = false;

        for (const rule of editor.meta.inputRules.insertData) {
          const context: InsertDataInputRuleContext = {
            cause: 'insertData',
            data,
            insertData,
            pluginKey: rule.pluginKey,
            text,
            ...selectionContext,
          };
          if (rule.enabled?.(context) === false) continue;
          if (
            rule.mimeTypes &&
            rule.mimeTypes.length > 0 &&
            !rule.mimeTypes.some((type) => !!context.data.getData(type))
          ) {
            continue;
          }

          const match = rule.resolve ? rule.resolve(context) : true;

          if (match === undefined) continue;
          if (rule.apply(context, match) !== false) {
            handled = true;

            break;
          }
        }

        if (handled) return;

        insertData(data);
      },
      insertText(text, options) {
        const rules = editor.meta.inputRules.insertText.byTrigger[text] ?? [];
        const selectionContext = createSelectionContext({ editor });
        let handled = false;

        for (const rule of rules) {
          const context: InsertTextInputRuleContext = {
            cause: 'insertText',
            insertText,
            options,
            pluginKey: rule.pluginKey,
            text,
            ...selectionContext,
          };
          if (!isTriggerMatch(rule.trigger, context.text)) continue;
          if (rule.enabled?.(context) === false) continue;

          const match = rule.resolve ? rule.resolve(context) : true;

          if (match === undefined) continue;
          if (rule.apply(context, match) !== false) {
            handled = true;

            break;
          }
        }

        if (handled) return;

        insertText(text, options);
      },
    },
  })
);
