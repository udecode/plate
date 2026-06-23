import { createEditorPlugin } from '../../../plugin';
import { withLegacyTransformOverride } from '../../../../internal/plugin/withLegacyTransformOverride';
import {
  getEditorBlock,
  getEditorPointAfter,
  getEditorPointBefore,
  getEditorRange,
  getEditorString,
  isEditorSelectionCollapsed,
} from '../../../../internal/utils/runtimeEditorQueries';

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
  const isCollapsed = !!selection && isEditorSelectionCollapsed(editor);
  const getBlockStartRange = createCachedGetter(() => {
    if (!selection) return;

    return getEditorRange(editor, 'start', selection);
  });
  const getBlockStartText = createCachedGetter(() => {
    const range = getBlockStartRange();

    return range ? getEditorString(editor, range) : undefined;
  });

  return {
    editor,
    getBlockEntry: createCachedGetter(() => {
      if (!selection) return;

      return getEditorBlock(editor, { at: selection });
    }),
    getBlockStartRange,
    getBlockStartText,
    getBlockTextBeforeSelection: createCachedGetter(
      () => getBlockStartText() ?? ''
    ),
    getCharAfter: createCachedGetter(() => {
      if (!selection || !isCollapsed) return;

      const afterPoint = getEditorPointAfter(editor, selection, {
        distance: 1,
        unit: 'character',
      });

      if (!afterPoint) return;

      return (
        getEditorString(editor, {
          anchor: selection.anchor,
          focus: afterPoint,
        }) || undefined
      );
    }),
    getCharBefore: createCachedGetter(() => {
      if (!selection || !isCollapsed) return;

      const beforePoint = getEditorPointBefore(editor, selection, {
        distance: 1,
        unit: 'character',
      });

      if (!beforePoint) return;

      return (
        getEditorString(editor, {
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

export const InputRulesPlugin = withLegacyTransformOverride(
  createEditorPlugin({
    editOnly: true,
    key: 'inputRules',
  }),
  ({ editor, tf: { insertBreak, insertData, insertText } }) => ({
    tf: {
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
      insertData(data: DataTransfer) {
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
        const currentOptions = options as InsertTextInputRuleContext['options'];
        const insertTextWithOptions: InsertTextInputRuleContext['insertText'] =
          (nextText, nextOptions) => {
            insertText(
              nextText,
              nextOptions as Parameters<typeof insertText>[1]
            );
          };
        let handled = false;

        for (const rule of rules) {
          const context: InsertTextInputRuleContext = {
            cause: 'insertText',
            insertText: insertTextWithOptions,
            options: currentOptions,
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
