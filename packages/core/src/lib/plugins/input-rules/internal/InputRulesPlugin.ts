import { ElementApi, RangeApi, type Element } from '@platejs/plite';

import type { BaseEditor } from '../../../editor';
import type {
  InsertBreakInputRuleContext,
  InsertDataInputRuleContext,
  InsertTextInputRuleContext,
  SelectionInputRuleContext,
} from '../types';

import { createBasePlugin } from '../../../plugin';

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

const dataTransferHasMime = (data: DataTransfer, mimeType: string) => {
  if (mimeType === 'Files') {
    return (data.files?.length ?? 0) > 0;
  }

  const types = Array.from(data.types ?? []);

  if (types.includes(mimeType)) return true;

  try {
    return !!data.getData(mimeType);
  } catch {
    return false;
  }
};

const createSelectionContext = ({
  editor,
}: {
  editor: BaseEditor;
}): Omit<SelectionInputRuleContext, 'pluginKey'> => {
  const selection = editor.read.selection();
  const isCollapsed = !!selection && RangeApi.isCollapsed(selection);
  const getBlockEntry = createCachedGetter(() =>
    selection
      ? editor.read((state) =>
          state.nodes.above<Element>({
            at: selection.focus,
            match: (node: unknown) =>
              ElementApi.isElement(node) && state.schema.isBlock(node),
          })
        )
      : undefined
  );
  const getBlockStartRange = createCachedGetter(() => {
    const blockEntry = getBlockEntry();

    if (!selection || !blockEntry) return;

    const anchor = editor.read.points.start(blockEntry[1]);

    if (!anchor) return;

    return {
      anchor,
      focus: RangeApi.start(selection),
    };
  });
  const getBlockStartText = createCachedGetter(() => {
    const range = getBlockStartRange();

    return range ? editor.read.text.string(range) : undefined;
  });
  const getCharAfter = createCachedGetter(() => {
    if (!selection || !isCollapsed) return;

    const afterPoint = editor.read.points.after(selection, {
      distance: 1,
      unit: 'character',
    });

    return afterPoint
      ? editor.read.text.string({
          anchor: selection.anchor,
          focus: afterPoint,
        }) || undefined
      : undefined;
  });
  const getCharBefore = createCachedGetter(() => {
    if (!selection || !isCollapsed) return;

    const beforePoint = editor.read.points.before(selection, {
      distance: 1,
      unit: 'character',
    });

    return beforePoint
      ? editor.read.text.string({
          anchor: beforePoint,
          focus: selection.anchor,
        }) || undefined
      : undefined;
  });

  return {
    editor,
    getBlockEntry,
    getBlockStartRange,
    getBlockStartText,
    getBlockTextBeforeSelection: () => getBlockStartText() ?? '',
    getCharAfter,
    getCharBefore,
    isCollapsed,
  };
};

const isTriggerMatch = (trigger: readonly string[] | string, text: string) =>
  Array.isArray(trigger) ? trigger.includes(text) : trigger === text;

export const InputRulesPlugin = createBasePlugin({
  editOnly: true,
  key: 'inputRules',
}).extendExtension(({ editor }) => ({
  clipboard: {
    insertData(data, { next, tx }) {
      const text = data.getData('text/plain') || null;
      const selectionContext = createSelectionContext({ editor });
      let handled = false;

      for (const rule of editor.runtime.inputRules.insertData) {
        const context: InsertDataInputRuleContext = {
          cause: 'insertData',
          data,
          insertData: (nextData) => {
            next(nextData);
          },
          pluginKey: rule.pluginKey,
          text,
          tx,
          ...selectionContext,
        };
        if (rule.enabled?.(context) === false) continue;
        if (
          rule.mimeTypes?.length &&
          !rule.mimeTypes.some((type) => dataTransferHasMime(data, type))
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

      if (handled) return true;

      return next(data);
    },
  },
  transforms: {
    insertBreak({ next, tx }) {
      const selectionContext = createSelectionContext({ editor });
      let handled = false;

      for (const rule of editor.runtime.inputRules.insertBreak) {
        const context: InsertBreakInputRuleContext = {
          cause: 'insertBreak',
          insertBreak: () => {
            next();
          },
          pluginKey: rule.pluginKey,
          tx,
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

      if (handled) return true;

      return next();
    },
    insertText({ next, options, text, tx }) {
      const rules = editor.runtime.inputRules.insertText.byTrigger[text] ?? [];
      const selectionContext = createSelectionContext({ editor });
      let handled = false;

      for (const rule of rules) {
        const context: InsertTextInputRuleContext = {
          cause: 'insertText',
          insertText: (nextText, nextOptions) => {
            next({ options: nextOptions, text: nextText });
          },
          options,
          pluginKey: rule.pluginKey,
          text,
          tx,
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

      if (handled) return true;

      return next();
    },
  },
}));
