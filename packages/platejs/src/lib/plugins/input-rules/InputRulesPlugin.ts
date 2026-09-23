import { domCommands } from '../../../dom/plite-dom.internal';
import {
  type EditorStateView,
  editorCommands,
  NodeApi,
  RangeApi,
} from '../../../facade';
import { getPlateRuntime } from '../../../internal/plugin/compilePlateModel';
import { definePlugin } from '../../plugin';
import { createPlatePluginPortal } from '../../plugin/createPluginContext.internal';
import {
  createInputRuleDecline,
  createInputRuleContinuation,
  isInputRuleDecline,
  isInputRuleContinuation,
} from './inputRuleContinuation.internal';
import type {
  InsertBreakInputRuleContext,
  InsertBreakInputRuleReadContext,
  InsertDataInputRuleContext,
  InsertDataInputRuleReadContext,
  InputRuleEditor,
  InsertTextInputRuleContext,
  InsertTextInputRuleReadContext,
  SelectionInputRuleContext,
} from './types';

const invalidApplyResult = () =>
  new Error(
    'An input rule must return undefined or the result of next(...) or decline().'
  );

export const InputRulesPlugin = definePlugin('inputRules', {
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
  const createReadEditor = (state: EditorStateView): InputRuleEditor => {
    const portals = new Map<object | string, unknown>();

    const plugin: InputRuleEditor['plugin'] = ((reference: object | string) => {
      const cached = portals.get(reference);

      if (cached) return cached;

      const portal =
        typeof reference === 'string'
          ? createPlatePluginPortal(editor, reference as never)
          : editor.plugin(reference as never);
      const name =
        typeof reference === 'string'
          ? reference
          : (reference as { name: string }).name;
      const store = Object.freeze({
        get: (...args: unknown[]) => {
          const pluginStore = portal.store as {
            get: (...args: unknown[]) => unknown;
          };

          return Reflect.apply(pluginStore.get, pluginStore, args);
        },
      });
      const value = Object.freeze(
        Object.defineProperties(
          {},
          {
            api: { enumerable: true, get: () => portal.api },
            installed: { enumerable: true, get: () => portal.installed },
            name: { enumerable: true, value: name },
            read: {
              enumerable: true,
              get: () => {
                if (!portal.installed) {
                  throw new Error(`Plate plugin "${name}" is not installed.`);
                }

                return Reflect.get(state, name) ?? {};
              },
            },
            schema: { enumerable: true, get: () => portal.schema },
            selectors: { enumerable: true, get: () => portal.selectors },
            store: { enumerable: true, value: store },
          }
        )
      );

      portals.set(reference, value);

      return value;
    }) as InputRuleEditor['plugin'];

    return { plugin, read: state } as unknown as InputRuleEditor;
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
    const isCollapsed = !!selection && state.selection.isCollapsed();
    const getBlockEntry = createCachedGetter(() =>
      selection
        ? state.nodes.block({
            at: selection.focus,
          })
        : undefined
    );
    const getBlockStartRange = createCachedGetter(() => {
      const blockEntry = getBlockEntry();

      if (!selection || !blockEntry) return undefined;

      const anchor = state.points.start(blockEntry[1]);

      if (!anchor) return undefined;

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
      if (!selection || !isCollapsed) return undefined;

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
      if (!selection || !isCollapsed) return undefined;

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
      editor: createReadEditor(state as EditorStateView),
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
    commands: ({ around }) => [
      around(domCommands.insertData, ({ input, state, next }) => {
        const rules = getPlateRuntime(editor).inputRules.insertData;

        const firstRule = rules[0];

        if (!firstRule) return next();

        const dataTypes = new Set(input.types);
        const selectionContext = createSelectionContext({ state });
        const context = {
          cause: 'insertData',
          data: input,
          plugin: firstRule.plugin,
          text: input.getData('text/plain') || null,
          ...selectionContext,
        } satisfies InsertDataInputRuleReadContext;
        let accepted:
          | {
              context: InsertDataInputRuleReadContext;
              match: unknown;
              rule: (typeof rules)[number];
            }
          | undefined;

        for (const rule of rules) {
          context.plugin = rule.plugin;

          const { enabled } = rule;

          if (typeof enabled === 'function' && !enabled(context)) {
            continue;
          }
          if (
            rule.mimeTypes?.length &&
            !rule.mimeTypes.some((type) => {
              if (type === 'Files') return (input.files?.length ?? 0) > 0;
              if (dataTypes.has(type)) return true;

              try {
                return !!input.getData(type);
              } catch {
                return false;
              }
            })
          ) {
            continue;
          }

          const { resolve } = rule;
          const match = typeof resolve === 'function' ? resolve(context) : true;

          if (match === undefined) continue;

          accepted = { context, match, rule };
          break;
        }

        if (!accepted) return next();

        let outcome: unknown;
        const prefix = state.transaction((tx) => {
          let continued = false;
          const ruleNext: InsertDataInputRuleContext['next'] = (data) => {
            if (continued) {
              throw new Error(
                'An input rule cannot continue insertData more than once.'
              );
            }

            continued = true;

            return createInputRuleContinuation(data);
          };

          outcome = accepted.rule.apply(
            {
              ...accepted.context,
              decline: createInputRuleDecline,
              next: ruleNext,
              tx,
            },
            accepted.match
          );

          if (
            outcome !== undefined &&
            !isInputRuleContinuation(outcome) &&
            !isInputRuleDecline(outcome)
          ) {
            throw invalidApplyResult();
          }
        });

        if (outcome === undefined) return prefix;
        if (isInputRuleDecline(outcome)) return next();

        const continuation = outcome as ReturnType<
          InsertDataInputRuleContext['next']
        >;

        return continuation.input === undefined
          ? next.after(prefix)
          : next.after(prefix, continuation.input);
      }),
      around(editorCommands.insertBreak, ({ state, next }) => {
        const rules = getPlateRuntime(editor).inputRules.insertBreak;

        const firstRule = rules[0];

        if (!firstRule) return next();

        const selectionContext = createSelectionContext({ state });
        const context = {
          cause: 'insertBreak',
          plugin: firstRule.plugin,
          ...selectionContext,
        } satisfies InsertBreakInputRuleReadContext;
        let accepted:
          | {
              context: InsertBreakInputRuleReadContext;
              match: unknown;
              rule: (typeof rules)[number];
            }
          | undefined;

        for (const rule of rules) {
          context.plugin = rule.plugin;

          const { enabled } = rule;

          if (typeof enabled === 'function' && !enabled(context)) {
            continue;
          }

          const { resolve } = rule;
          const match = typeof resolve === 'function' ? resolve(context) : true;

          if (match === undefined) continue;

          accepted = { context, match, rule };
          break;
        }

        if (!accepted) return next();

        let outcome: unknown;
        const prefix = state.transaction((tx) => {
          let continued = false;
          const ruleNext: InsertBreakInputRuleContext['next'] = () => {
            if (continued) {
              throw new Error(
                'An input rule cannot continue insertBreak more than once.'
              );
            }

            continued = true;

            return createInputRuleContinuation(undefined);
          };

          outcome = accepted.rule.apply(
            {
              ...accepted.context,
              decline: createInputRuleDecline,
              next: ruleNext,
              tx,
            },
            accepted.match
          );

          if (
            outcome !== undefined &&
            !isInputRuleContinuation(outcome) &&
            !isInputRuleDecline(outcome)
          ) {
            throw invalidApplyResult();
          }
        });

        if (outcome === undefined) return prefix;
        if (isInputRuleDecline(outcome)) return next();

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

        const firstRule = rules[0];

        if (!firstRule) return next();

        const selectionContext = createSelectionContext({ state });
        const context = {
          cause: 'insertText',
          options: commandOptions,
          plugin: firstRule.plugin,
          text: input.text,
          ...selectionContext,
        } satisfies InsertTextInputRuleReadContext;
        let accepted:
          | {
              context: InsertTextInputRuleReadContext;
              match: unknown;
              rule: (typeof rules)[number];
            }
          | undefined;

        for (const rule of rules) {
          context.plugin = rule.plugin;

          const { enabled } = rule;

          if (typeof enabled === 'function' && !enabled(context)) {
            continue;
          }

          const { resolve } = rule;
          const match = typeof resolve === 'function' ? resolve(context) : true;

          if (match === undefined) continue;

          accepted = { context, match, rule };
          break;
        }

        if (!accepted) return next();

        let outcome: unknown;
        const prefix = state.transaction((tx) => {
          let continued = false;
          const ruleNext: InsertTextInputRuleContext['next'] = (
            text,
            options
          ) => {
            if (continued) {
              throw new Error(
                'An input rule cannot continue insertText more than once.'
              );
            }

            continued = true;

            return createInputRuleContinuation(
              text === undefined ? undefined : { options, text }
            );
          };

          outcome = accepted.rule.apply(
            {
              ...accepted.context,
              decline: createInputRuleDecline,
              next: ruleNext,
              tx,
            },
            accepted.match
          );

          if (
            outcome !== undefined &&
            !isInputRuleContinuation(outcome) &&
            !isInputRuleDecline(outcome)
          ) {
            throw invalidApplyResult();
          }
        });

        if (outcome === undefined) return prefix;
        if (isInputRuleDecline(outcome)) return next();

        const continuation = outcome as ReturnType<
          InsertTextInputRuleContext['next']
        >;

        return continuation.input === undefined
          ? next.after(prefix)
          : next.after(prefix, { ...input, ...continuation.input });
      }),
    ],
  };
});
