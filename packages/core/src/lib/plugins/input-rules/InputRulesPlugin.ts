import {
  type Element,
  type EditorStateView,
  editorCommands,
  ElementApi,
  NodeApi,
  RangeApi,
} from '@platejs/plite';
import { clipboardHandler } from '@platejs/plite-dom';

import type {
  InsertBreakInputRuleContext,
  InsertDataInputRuleContext,
  InsertTextInputRuleContext,
  SelectionInputRuleContext,
} from './types';

import { defineBasePlugin } from '../../plugin';
import { getPlateRuntime } from '../../../internal/plugin/compilePlateModel';

export const InputRulesPlugin = defineBasePlugin('inputRules', {
  editOnly: true,
}).extend(({ editor }) => {
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
    state,
  }: {
    state: Pick<
      EditorStateView,
      'nodes' | 'points' | 'schema' | 'selection' | 'text'
    >;
  }): Omit<SelectionInputRuleContext, 'plugin'> => {
    const selection = state.selection();
    const isCollapsed = !!selection && RangeApi.isCollapsed(selection);
    const getBlockEntry = createCachedGetter(() =>
      selection
        ? state.nodes.above({
            at: selection.focus,
            match: (node): node is Element =>
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

  return {
    contributions: [
      clipboardHandler({
        insertData(data, { next, tx }) {
          const text = data.getData('text/plain') || null;
          const selectionContext = createSelectionContext({ state: tx });
          let handled = false;

          for (const rule of getPlateRuntime(editor).inputRules.insertData) {
            const context = {
              cause: 'insertData',
              data,
              insertData: (nextData) => {
                next(nextData);
              },
              plugin: rule.plugin,
              text,
              tx,
              ...selectionContext,
            } satisfies Omit<InsertDataInputRuleContext, 'tx'> & {
              tx: typeof tx;
            };
            if (
              typeof rule.enabled === 'function' &&
              Reflect.apply(rule.enabled, undefined, [context]) === false
            ) {
              continue;
            }
            if (
              rule.mimeTypes?.length &&
              !rule.mimeTypes.some((type) => {
                if (type === 'Files') return (data.files?.length ?? 0) > 0;
                if (Array.from(data.types ?? []).includes(type)) return true;

                try {
                  return !!data.getData(type);
                } catch {
                  return false;
                }
              })
            ) {
              continue;
            }

            const match =
              typeof rule.resolve === 'function'
                ? Reflect.apply(rule.resolve, undefined, [context])
                : true;

            if (match === undefined) continue;
            if (
              Reflect.apply(rule.apply, undefined, [context, match]) !== false
            ) {
              handled = true;

              break;
            }
          }

          if (handled) return true;

          return next(data);
        },
      }),
    ],
    commands: ({ around }) => [
      around(editorCommands.insertBreak, ({ state, next }) => {
        let handled = false;
        let continueInsertion = false;
        const prefix = state.transaction((tx) => {
          const selectionContext = createSelectionContext({ state: tx });

          for (const rule of getPlateRuntime(editor).inputRules.insertBreak) {
            const context = {
              cause: 'insertBreak',
              insertBreak: () => {
                if (continueInsertion) {
                  throw new Error(
                    'An input rule cannot continue insertBreak more than once.'
                  );
                }

                continueInsertion = true;
              },
              plugin: rule.plugin,
              tx,
              ...selectionContext,
            } satisfies Omit<InsertBreakInputRuleContext, 'tx'> & {
              tx: typeof tx;
            };
            if (
              typeof rule.enabled === 'function' &&
              Reflect.apply(rule.enabled, undefined, [context]) === false
            ) {
              continue;
            }
            const match =
              typeof rule.resolve === 'function'
                ? Reflect.apply(rule.resolve, undefined, [context])
                : true;

            if (match === undefined) continue;
            if (
              Reflect.apply(rule.apply, undefined, [context, match]) !== false
            ) {
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
          const selectionContext = createSelectionContext({ state: tx });

          for (const rule of rules) {
            const context = {
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
              plugin: rule.plugin,
              text: input.text,
              tx,
              ...selectionContext,
            } satisfies Omit<InsertTextInputRuleContext, 'tx'> & {
              tx: typeof tx;
            };
            if (
              Array.isArray(rule.trigger)
                ? !rule.trigger.includes(context.text)
                : rule.trigger !== context.text
            ) {
              continue;
            }
            if (
              typeof rule.enabled === 'function' &&
              Reflect.apply(rule.enabled, undefined, [context]) === false
            ) {
              continue;
            }

            const match =
              typeof rule.resolve === 'function'
                ? Reflect.apply(rule.resolve, undefined, [context])
                : true;

            if (match === undefined) continue;
            if (
              Reflect.apply(rule.apply, undefined, [context, match]) !== false
            ) {
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
  };
});
