import {
  type EditorStateView,
  type Element,
  editorCommands,
  ElementApi,
  NodeApi,
  RangeApi,
} from '@platejs/plite';

import type { BaseEditor } from '../../../editor';
import type {
  InsertBreakInputRuleContext,
  InsertDataInputRuleContext,
  InsertTextInputRuleContext,
  SelectionInputRuleContext,
} from '../types';

import { createBasePlugin } from '../../../plugin';
import { getPlateRuntime } from '../../../../internal/plugin/compilePlateModel';

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
  state = editor.read,
}: {
  editor: BaseEditor;
  state?: Pick<
    EditorStateView,
    'nodes' | 'points' | 'schema' | 'selection' | 'text'
  >;
}): Omit<SelectionInputRuleContext, 'pluginKey'> => {
  const selection = state.selection();
  const isCollapsed = !!selection && RangeApi.isCollapsed(selection);
  const getBlockEntry = createCachedGetter(() =>
    selection
      ? state.nodes.above<Element>({
          at: selection.focus,
          match: (node: unknown) =>
            ElementApi.isElement(node) && state.schema.isBlock(node),
        })
      : undefined
  );
  const getBlockStartRange = createCachedGetter(() => {
    const blockEntry = getBlockEntry();

    if (!selection || !blockEntry) return;

    const anchor = state.points.start(blockEntry[1]);

    if (!anchor) return;

    return {
      anchor,
      focus: RangeApi.start(selection),
    };
  });
  const getBlockStartText = createCachedGetter(() => {
    const range = getBlockStartRange();

    return range ? state.text.string(range) : undefined;
  });
  const getCharAfter = createCachedGetter(() => {
    if (!selection || !isCollapsed) return;

    const afterPoint = state.points.after(selection, {
      distance: 1,
      unit: 'character',
    });

    return afterPoint
      ? state.text.string({
          anchor: selection.anchor,
          focus: afterPoint,
        }) || undefined
      : undefined;
  });
  const getCharBefore = createCachedGetter(() => {
    if (!selection || !isCollapsed) return;

    const beforePoint = state.points.before(selection, {
      distance: 1,
      unit: 'character',
    });

    return beforePoint
      ? state.text.string({
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
      const selectionContext = createSelectionContext({ editor, state: tx });
      let handled = false;

      for (const rule of getPlateRuntime(editor).inputRules.insertData) {
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
  commands: ({ around }) => [
    around(editorCommands.insertBreak, ({ state, next }) => {
      let handled = false;
      let continueInsertion = false;
      const prefix = state.transaction((tx) => {
        const selectionContext = createSelectionContext({ editor, state: tx });

        for (const rule of getPlateRuntime(editor).inputRules.insertBreak) {
          const context: InsertBreakInputRuleContext = {
            cause: 'insertBreak',
            insertBreak: () => {
              if (continueInsertion) {
                throw new Error(
                  'An input rule cannot continue insertBreak more than once.'
                );
              }

              continueInsertion = true;
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
      });

      if (handled && !continueInsertion) return prefix;

      return next.after(prefix);
    }),
    around(editorCommands.insertText, ({ input, state, next }) => {
      const rules =
        getPlateRuntime(editor).inputRules.insertText.byTrigger[input.text] ??
        [];
      const target = input.options?.at;
      const resolvedTarget = NodeApi.isNode(target)
        ? state.nodes.path(target)
        : target;

      if (NodeApi.isNode(target) && !resolvedTarget) return next();

      const commandOptions = input.options
        ? { ...input.options, at: resolvedTarget }
        : undefined;
      let handled = false;
      let continuation: typeof input | undefined;
      const prefix = state.transaction((tx) => {
        const selectionContext = createSelectionContext({ editor, state: tx });

        for (const rule of rules) {
          const context: InsertTextInputRuleContext = {
            cause: 'insertText',
            insertText: (text, options) => {
              if (continuation) {
                throw new Error(
                  'An input rule cannot continue insertText more than once.'
                );
              }

              continuation = { ...input, options, text };
            },
            options: commandOptions,
            pluginKey: rule.pluginKey,
            text: input.text,
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
      });

      if (handled && !continuation) return prefix;

      return continuation
        ? next.after(prefix, continuation)
        : next.after(prefix);
    }),
  ],
}));
