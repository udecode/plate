import { domCommands } from '../../../dom/plite-dom.internal';
import {
  attachTransactionSpecAfterCommit,
  type DocumentChange,
  type EditorStateView,
  editorCommands,
  getActiveCommandEditor,
  type NodeSelection,
  type NodeTarget,
  PointApi,
  RangeApi,
  readEditorCommitHistoryEntry,
  reportEditorLifecycleError,
  runEditorObserver,
  type Selection,
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
import { isInputRuleVetoed } from './inputRuleVeto.internal';
import type {
  InsertBreakInputRuleContext,
  InsertBreakInputRuleReadContext,
  InsertDataInputRuleContext,
  InsertDataInputRuleReadContext,
  InputRuleEditor,
  InsertTextInputRuleContext,
  InsertTextInputRuleReadContext,
  ResolvedInputRulesMeta,
  SelectionInputRuleContext,
} from './types';

const insertsAtCaret = (
  at: NodeSelection | NodeTarget | undefined,
  selection: ReturnType<EditorStateView['selection']>
) =>
  !at ||
  (!!selection &&
    (RangeApi.isRange(at)
      ? RangeApi.equals(at, selection)
      : PointApi.isPoint(at) &&
        RangeApi.isCollapsed(selection) &&
        PointApi.equals(at, selection.anchor)));

const INPUT_RULE_TAG = 'input-rule';

// Peers get a follow-up commit exactly when they got the paste's.
const PEER_SKIPPED_TAGS = new Set(['collaboration', 'skip-collab']);

type FollowUpRule = Extract<
  ResolvedInputRulesMeta['insertData'][number],
  { followUp: (...args: never[]) => unknown }
>;

const followUpRuleCache = new WeakMap<
  ResolvedInputRulesMeta['insertData'],
  readonly FollowUpRule[]
>();

const followUpRulesOf = (rules: ResolvedInputRulesMeta['insertData']) => {
  let followUps = followUpRuleCache.get(rules);

  if (!followUps) {
    followUps = rules.filter(
      (rule): rule is FollowUpRule => rule.followUp !== undefined
    );
    followUpRuleCache.set(rules, followUps);
  }

  return followUps;
};

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  (typeof value === 'object' || typeof value === 'function') &&
  value !== null &&
  typeof (value as { then?: unknown }).then === 'function';

const invalidApplyResult = () =>
  new Error(
    'An input rule must return undefined or the result of next(...) or decline().'
  );

export const InputRulesPlugin = definePlugin('inputRules', {
  editOnly: true,
}).extend(({ editor }) => {
  const refuseThenable = (
    value: PromiseLike<unknown>,
    pluginName: string,
    message: string
  ): never => {
    void new Promise<unknown>((resolve) => {
      resolve(value);
    }).then(undefined, (error: unknown) =>
      reportEditorLifecycleError(
        Object.freeze({
          cause: error,
          editor,
          phase: 'after-commit',
          pluginName,
        })
      )
    );

    throw new Error(message);
  };
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

    return {
      key: state.key,
      plugin,
      read: state,
    } as unknown as InputRuleEditor;
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

  let pendingRuleKey: string | undefined;
  let revertible:
    | { inverse: DocumentChange; selection: Selection; text: string }
    | undefined;

  return {
    on: {
      commit: ({ commit }) => {
        const changesDocument = commit.changed.has('document');

        if (
          commit.tags.includes(INPUT_RULE_TAG) &&
          changesDocument &&
          pendingRuleKey !== undefined
        ) {
          revertible = {
            inverse: commit.inverseChanges,
            selection: commit.selectionBefore,
            text: pendingRuleKey,
          };
        } else if (changesDocument || commit.selectionChanged) {
          revertible = undefined;
        }

        pendingRuleKey = undefined;
      },
    },
    commands: ({ around }) => [
      around(editorCommands.delete, ({ input, state, next }) => {
        const rule = revertible;

        if (
          !rule?.selection ||
          input.direction !== 'backward' ||
          input.unit !== 'character' ||
          !state.selection.isCollapsed()
        ) {
          return next();
        }

        return state.transaction((tx) => {
          tx.changes.apply(rule.inverse);
          tx.selection.set(rule.selection);
          tx.text.insert(rule.text);
        });
      }),
      around(domCommands.insertData, ({ input, state, next }) => {
        const rules = getPlateRuntime(editor).inputRules.insertData;

        const firstRule = rules[0];

        if (!firstRule || isInputRuleVetoed(editor, state)) return next();

        const dataTypes = new Set(input.types);
        const selectionContext = createSelectionContext({ state });
        const context = {
          cause: 'insertData',
          data: input,
          plugin: firstRule.plugin,
          text: input.getData('text/plain') || null,
          ...selectionContext,
        } satisfies InsertDataInputRuleReadContext;
        type Rule = (typeof rules)[number];
        const resolveRule = (
          rule: Rule,
          ruleContext: InsertDataInputRuleReadContext
        ) => {
          const { enabled } = rule;

          if (typeof enabled === 'function' && !enabled(ruleContext)) {
            return undefined;
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
            return undefined;
          }

          const { resolve } = rule;

          return typeof resolve === 'function' ? resolve(ruleContext) : true;
        };
        let accepted:
          | { apply: NonNullable<Rule['apply']>; match: unknown; rule: Rule }
          | undefined;

        for (const rule of rules) {
          const { apply } = rule;

          if (!apply) continue;

          context.plugin = rule.plugin;

          const match = resolveRule(rule, context);

          if (match === undefined) continue;

          accepted = { apply, match, rule };
          break;
        }

        let following: { match: unknown; rule: FollowUpRule } | undefined;

        for (const rule of followUpRulesOf(rules)) {
          const match = resolveRule(rule, { ...context, plugin: rule.plugin });

          if (match === undefined) continue;
          if (isThenable(match)) {
            refuseThenable(
              match,
              rule.plugin.name,
              'An input rule follow-up must resolve synchronously.'
            );
          }

          following = { match, rule };
          break;
        }

        const pastingView = following ? getActiveCommandEditor() : undefined;
        const followed = (result: ReturnType<typeof next>) => {
          if (
            !following ||
            !pastingView ||
            result === false ||
            result.changes.empty
          ) {
            return result;
          }

          const { match, rule } = following;

          return attachTransactionSpecAfterCommit(result, ({ commit }) => {
            const replacedSelection = commit.tags.includes('replace-range');
            const changedViewRoot = commit.changed.has(
              'document',
              pastingView.read.view.root()
            );

            if (
              !readEditorCommitHistoryEntry(editor, commit) ||
              commit.tags.some((tag) => PEER_SKIPPED_TAGS.has(tag)) ||
              replacedSelection ||
              !changedViewRoot ||
              pastingView.read.view.isReadOnly()
            ) {
              return;
            }

            runEditorObserver(
              editor,
              'after-commit',
              () => {
                pastingView.update({ tags: ['history-push'] }, (tx) => {
                  const followUp: (
                    context: { tx: unknown },
                    match: unknown
                  ) => unknown = rule.followUp;
                  const returned = followUp.call(rule, { tx }, match);

                  if (isThenable(returned)) {
                    refuseThenable(
                      returned,
                      rule.plugin.name,
                      'An input rule follow-up must be synchronous.'
                    );
                  }
                });
              },
              rule.plugin.name
            );
          });
        };
        if (!accepted) return followed(next());

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

          outcome = accepted.apply.call(
            accepted.rule,
            {
              ...context,
              decline: createInputRuleDecline,
              next: ruleNext,
              plugin: accepted.rule.plugin,
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

        if (outcome === undefined) return followed(prefix);
        if (isInputRuleDecline(outcome)) return followed(next());

        const continuation = outcome as ReturnType<
          InsertDataInputRuleContext['next']
        >;

        return followed(
          continuation.input === undefined
            ? next.after(prefix)
            : next.after(prefix, continuation.input)
        );
      }),
      around(editorCommands.insertBreak, ({ state, next }) => {
        const rules = getPlateRuntime(editor).inputRules.insertBreak;

        const firstRule = rules[0];

        if (!firstRule || isInputRuleVetoed(editor, state)) return next();

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
        const firstRule = rules[0];

        if (
          !firstRule ||
          !insertsAtCaret(input.options?.at, state.selection()) ||
          isInputRuleVetoed(editor, state)
        ) {
          return next();
        }

        const selectionContext = createSelectionContext({ state });
        const context = {
          cause: 'insertText',
          options: input.options,
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

        if (isInputRuleDecline(outcome)) return next();

        const continuation = outcome as
          | ReturnType<InsertTextInputRuleContext['next']>
          | undefined;
        const typesKey =
          continuation !== undefined &&
          (continuation.input?.text ?? input.text) === input.text;
        const prefixIsEmpty = prefix.changes.empty && !prefix.selection;
        let spec = prefix;

        if (!prefixIsEmpty || !typesKey) {
          pendingRuleKey = input.text;
          spec = state.transaction.extend(prefix, (tx) => {
            tx.tags.add(INPUT_RULE_TAG);
          });
        }
        if (!continuation) return spec;
        if (continuation.input === undefined) return next.after(spec);

        const { options, text } = continuation.input;
        const keepsOptions = !options && prefixIsEmpty;

        return next.after(spec, {
          ...input,
          options: keepsOptions ? input.options : options,
          text,
        });
      }),
    ],
  };
});
