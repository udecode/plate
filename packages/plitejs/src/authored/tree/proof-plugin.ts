import {
  DocumentChange,
  getInternalDocumentRootChange,
  valueRoot,
} from '../../core/change/document-change';
import { DocumentIndex } from '../../core/change/document-index';
import type { JsonEditorValue, JsonNode } from '../../core/change/tokens';
import { registerEditorContent } from '../../core/content';
import {
  registerEditorDocumentRecorder,
  registerEditorDraftGuard,
} from '../../core/document-recorder';
import {
  getEditorRuntimeOwner,
  getEditorSchema,
} from '../../core/editor-runtime';
import { definePlugin } from '../../core/plugin';
import { completeChildrenAt } from '../../core/representation';
import { EditorSchemaValidationError } from '../../core/schema-validation';
import type {
  AnyEditor as Editor,
  EditorDocumentValue,
  Selection,
} from '../../interfaces/editor';
import type { Element } from '../../interfaces/element';
import type { Descendant } from '../../interfaces/node';
import { type Point, PointApi } from '../../interfaces/point';
import { relinkCuts } from './cuts';
import {
  AUTHORED_MARKS_KEY,
  AuthoredMarkError,
  createAuthoredMarksValidator,
  authoredMarksSchema,
  findAuthoredMark,
  readAuthoredMarks,
} from './marks';
import { type AuthoredRecordIntent, recordAuthoredSteps } from './record';
import { completeProposed } from './record-completion';
import {
  type AuthoredResolveSchema,
  projectAuthoredValue,
  resolveAuthoredValue,
} from './resolve';

export type AuthoredTreeDecision = Readonly<{
  action: 'accept' | 'reject';
  changes: readonly string[];
}>;

export type AuthoredTreeDecisionResult =
  | Readonly<{
      ids: readonly string[];
      status: 'applied' | 'invalid' | 'unchanged';
    }>
  | Readonly<{
      ids: readonly string[];
      status: 'blocked';
      with: readonly string[];
    }>;

export const authoredResolveSchemaOf = (
  editor: Editor
): AuthoredResolveSchema => {
  const schema = getEditorSchema(editor);

  return {
    complete: (children, site, root, vacated) => {
      const completion = completeChildrenAt(
        editor,
        site as readonly Element[],
        children as readonly Descendant[],
        root,
        vacated
      );

      return {
        built: completion.built.map(({ node, slot }) => ({
          node: node as JsonNode,
          slot,
        })),
        children: completion.children,
      };
    },
    content: (type, root) => {
      const content =
        type === null
          ? schema.getRootContent(root)
          : schema.getElementContent(type);

      return content
        ? {
            allowsText: content.allowsText,
            prefix: content.prefix?.length ?? 0,
          }
        : null;
    },
  };
};

// Only a refusal of the resolved document is an invalid decision.
const isRefusal = (error: unknown) =>
  error instanceof EditorSchemaValidationError ||
  error instanceof AuthoredMarkError;

const isAuthoredSetValued = (_node: unknown, key: string) =>
  key === AUTHORED_MARKS_KEY;

export type AuthoredTreeProofOptions = Readonly<{
  authorId: string;
  /** Change ids for new suggestions; defaults to a writer-prefixed UUID. */
  createChangeId?: () => string;
  /**
   * Ids for format tags and inline split cuts; defaults to 12 random hex
   * digits.
   */
  createTagId?: () => string;
  intent?: AuthoredRecordIntent;
  now?: () => number;
}>;

type ProofState = {
  /** A forced change keeps one creation time across its transactions. */
  forced: Readonly<{ at: number; changeId: string }> | null;
  intent: AuthoredRecordIntent;
  passThrough: number;
};

const STATES = new WeakMap<object, ProofState>();

const isStruck = (node: unknown) =>
  readAuthoredMarks(node).some((mark) => mark.kind === 'delete');

const createDocumentMarksValidator = () => {
  const validate = createAuthoredMarksValidator();

  return (value: EditorDocumentValue) => {
    validate(value.children);
    for (const children of Object.values(value.roots ?? {})) validate(children);
  };
};

const positionOf = (value: JsonEditorValue, root: string, point: Point) =>
  DocumentIndex.fromValue(valueRoot(value, root)).positionAt(point);

const mapPoint = (
  point: Point,
  input: Readonly<{
    after: JsonEditorValue;
    indexes: ReadonlyMap<string, DocumentIndex>;
    map: (root: string, position: number, assoc: -1 | 1) => number;
    root: string;
  }>,
  assoc: -1 | 1
): Point => {
  const index = input.indexes.get(input.root);

  if (!index) return point;

  const recorded = index.pointAt(
    input.map(input.root, positionOf(input.after, input.root, point), assoc),
    assoc
  );

  return recorded
    ? { ...point, offset: recorded.offset, path: [...recorded.path] }
    : point;
};

/**
 * Proof install of the review tree for Phase 1 of
 * docs/plans/2026-10-08-authored-review.md, which the proof route and its
 * tests import. The production `authored` plugin stays the owner until that
 * plan's Phase 2 replaces it with this tree.
 */
export const authoredTreeProof = (options: AuthoredTreeProofOptions) => {
  const createChangeId =
    options.createChangeId ??
    (() => `${options.authorId}:${crypto.randomUUID()}`);
  // Every saved tag, cut and `over` link carries an id, so ids stay short: a
  // format tag's only has to differ from the other tags on its key, and a
  // cut's from the other cuts in the document.
  const createTagId =
    options.createTagId ??
    (() => crypto.randomUUID().replaceAll('-', '').slice(0, 12));
  const now = options.now ?? Date.now;

  return definePlugin('authoredTree', {
    schema: authoredMarksSchema,
    api: ({ editor }) => ({
      /** Editing applies writes as written; Suggesting records them as marks. */
      setIntent: (intent: AuthoredRecordIntent) => {
        const state = STATES.get(getEditorRuntimeOwner(editor));

        if (state) state.intent = intent;
      },
      /** Record writes in `run` under one forced change, whatever the intent. */
      propose: (changeId: string, run: () => void) => {
        const state = STATES.get(getEditorRuntimeOwner(editor));

        if (!state) {
          run();
          return;
        }

        const previous = state.forced;
        const value = editor.read.value();
        const existing = findAuthoredMark(
          [...value.children, ...Object.values(value.roots ?? {}).flat()],
          changeId
        );

        state.forced = { at: existing?.at ?? now(), changeId };
        try {
          run();
        } finally {
          state.forced = previous;
        }
      },
      /**
       * Accept or reject changes as one undoable, unrecorded transaction.
       * Several decisions decide together, so changes that wait on each other
       * can be accepted and rejected in one call. A blocked result names the
       * changes to decide with it. A result is invalid when one change is both
       * accepted and rejected, or when the schema refuses the result.
       */
      decide: (
        decisions: AuthoredTreeDecision | readonly AuthoredTreeDecision[]
      ): AuthoredTreeDecisionResult => {
        const state = STATES.get(getEditorRuntimeOwner(editor));
        const value = editor.read.value() as JsonEditorValue;
        const actions = new Map<string, 'accept' | 'reject'>();
        let conflicting = false;

        for (const decision of [decisions].flat()) {
          for (const change of decision.changes) {
            conflicting ||=
              (actions.get(change) ?? decision.action) !== decision.action;
            actions.set(change, decision.action);
          }
        }

        const ids = [...actions.keys()];

        if (conflicting) return { ids, status: 'invalid' };
        let resolution: ReturnType<typeof resolveAuthoredValue>;

        try {
          resolution = resolveAuthoredValue(
            value,
            (change) => actions.get(change) ?? 'keep',
            authoredResolveSchemaOf(editor)
          );
        } catch (error) {
          if (isRefusal(error)) return { ids, status: 'invalid' };
          throw error;
        }
        const blockers = resolution.blockers.filter(
          (change) => !actions.has(change)
        );

        if (blockers.length > 0) {
          return { ids, status: 'blocked', with: blockers };
        }
        if (resolution.unplaceable) return { ids, status: 'invalid' };

        const change = DocumentChange.between(value, resolution.value, {
          isSetValued: isAuthoredSetValued,
        });

        if (change.empty) return { ids: [], status: 'unchanged' };
        if (state) state.passThrough += 1;
        try {
          editor.update((tx) => {
            tx.changes.apply(change);
          });
        } catch (error) {
          if (isRefusal(error)) return { ids, status: 'invalid' };
          throw error;
        } finally {
          if (state) state.passThrough -= 1;
        }

        return { ids: resolution.decided, status: 'applied' };
      },
      /**
       * `proposed` reads the document with every pending change accepted;
       * `accepted` reads it with every pending change rejected.
       */
      project: (projection: 'accepted' | 'proposed') =>
        projectAuthoredValue(
          editor.read.value(),
          projection,
          authoredResolveSchemaOf(editor)
        ),
      /** Run writes that the review tree must not record, such as decisions. */
      passThrough: (run: () => void) => {
        const state = STATES.get(getEditorRuntimeOwner(editor));

        if (!state) {
          run();
          return;
        }

        state.passThrough += 1;
        try {
          run();
        } finally {
          state.passThrough -= 1;
        }
      },
    }),
    activate: ({ beforePublish, editor, onCleanup }) => {
      const state: ProofState = {
        forced: null,
        intent: options.intent ?? 'edit',
        passThrough: 0,
      };

      STATES.set(getEditorRuntimeOwner(editor), state);
      const assertDocumentMarks = createDocumentMarksValidator();

      beforePublish(() => assertDocumentMarks(editor.read.value()));
      onCleanup(registerEditorDraftGuard(editor, assertDocumentMarks));
      // A node's own marks decide, so live text inside a struck block reads.
      onCleanup(
        registerEditorContent(editor, (_owner, node) => !isStruck(node))
      );
      onCleanup(
        registerEditorDocumentRecorder(editor, (input) => {
          if (
            input.tags.includes('historic') ||
            input.tags.includes('collaboration')
          ) {
            return null;
          }
          // A decision records nothing, but a fragment it or its corrections
          // remove hands its cuts to its neighbours.
          if (state.passThrough > 0) {
            const relink = relinkCuts(
              input.change,
              input.before,
              input.after,
              (root) => DocumentIndex.fromValue(valueRoot(input.after, root))
            );

            return relink
              ? {
                  change: input.change.compose(relink.change),
                  selection: input.selection,
                }
              : null;
          }

          const intent = state.forced ? 'propose' : state.intent;
          const before = input.before as JsonEditorValue;
          const after = input.after as JsonEditorValue;
          const focusBefore =
            input.selectionBefore?.kind === 'text' &&
            PointApi.equals(
              input.selectionBefore.anchor,
              input.selectionBefore.focus
            )
              ? input.selectionBefore.focus
              : null;
          const selectionPosition = focusBefore
            ? positionOf(before, input.selectionBeforeRoot, focusBefore)
            : null;
          const changeId = createChangeId();
          const at = state.forced?.at ?? now();
          const recorded = recordAuthoredSteps({
            before,
            changeId,
            createRoots: input.change.createRoots,
            createTagId,
            deleteRoots: input.change.deleteRoots,
            fill: (site, root) =>
              completeChildrenAt(
                editor,
                site.map((props) => ({
                  ...props,
                  children: [],
                  type: String(props.type),
                })),
                [],
                root
              ).children,
            forcedChangeId: state.forced?.changeId ?? null,
            intent,
            isInline: (props) =>
              getEditorSchema(editor).isInline({
                ...props,
                children: [],
                type: String(props.type),
              }),
            keepsOnSplit: (props, path, root, key, draftRoot) =>
              Object.hasOwn(
                getEditorSchema(editor).elementPropertiesForSplitAt(
                  // Only the key's lifecycle matters, so an absent value
                  // stands in as `true`.
                  {
                    ...props,
                    [key]: props[key] ?? true,
                    children: [],
                    type: String(props.type),
                  },
                  [...path],
                  root,
                  draftRoot as readonly Descendant[]
                ),
                key
              ),
            now: at,
            oneText: (type) => {
              const content = getEditorSchema(editor).getElementContent(type);

              return content?.max === 1 && content.allowsText;
            },
            selectionBefore:
              selectionPosition === null
                ? null
                : {
                    position: selectionPosition,
                    root: input.selectionBeforeRoot,
                  },
            steps: input.steps,
            writer: options.authorId,
          });
          // Map only through the recorded change: the recorder slot's finalize
          // then applies the canonical pass and maps the selection through it.
          const map = {
            after,
            indexes: recorded.indexedAfter,
            map: recorded.mapPosition,
            root: input.selectionRoot,
          };
          const selection: Selection =
            input.selection?.kind === 'text'
              ? {
                  ...input.selection,
                  anchor: mapPoint(input.selection.anchor, map, -1),
                  focus: mapPoint(input.selection.focus, map, -1),
                }
              : input.selection;

          // Editing removes fragments outright, and so does withdrawing one's
          // own insertion, which can hold another author's cuts; either way
          // their cuts move to the fragments that stay.
          const roots = [
            ...new Set([
              ...Object.keys(before.roots ?? {}),
              ...recorded.indexedAfter.keys(),
            ]),
          ].filter(
            (root) => root !== 'main' && !input.change.deleteRoots.has(root)
          );
          const { roots: _beforeRoots, ...plain } = before;
          const valueOf = (indexes: ReadonlyMap<string, DocumentIndex>) =>
            ({
              ...plain,
              children: indexes.get('main')?.value ?? before.children,
              ...(roots.length > 0
                ? {
                    roots: Object.fromEntries(
                      roots.map((root) => [
                        root,
                        indexes.get(root)?.value ?? valueRoot(before, root),
                      ])
                    ),
                  }
                : {}),
            }) as JsonEditorValue;
          const written = valueOf(recorded.indexedAfter);
          const relink = relinkCuts(
            recorded.change,
            before,
            written,
            (root) =>
              recorded.indexedAfter.get(root) ??
              DocumentIndex.fromValue(valueRoot(written, root))
          );
          const change = relink
            ? recorded.change.compose(relink.change)
            : recorded.change;
          const indexes = relink
            ? new Map([...recorded.indexedAfter, ...relink.indexes])
            : recorded.indexedAfter;
          const filled =
            intent === 'propose'
              ? completeProposed({
                  after: valueOf(indexes),
                  before,
                  change,
                  createTagId,
                  editor,
                  indexes,
                  mark: {
                    at,
                    author: options.authorId,
                    change: state.forced?.changeId ?? changeId,
                  },
                })
              : null;

          if (!filled) {
            return {
              anchorChange: recorded.anchorChange,
              change,
              indexedAfter: indexes,
              selection,
            };
          }

          const fill = (point: Point, assoc: -1 | 1): Point => {
            const root = input.selectionRoot;
            const rootChange = getInternalDocumentRootChange(
              filled.change,
              root
            );
            const position = rootChange?.mapPos(
              positionOf(valueOf(indexes), root, point),
              assoc
            );
            const mapped =
              position === undefined || position === null
                ? null
                : filled.indexes.get(root)?.pointAt(position, assoc);

            return mapped
              ? { ...point, offset: mapped.offset, path: [...mapped.path] }
              : point;
          };

          return {
            anchorChange: (plainAfter) =>
              recorded.anchorChange(plainAfter).compose(filled.change),
            change: change.compose(filled.change),
            indexedAfter: filled.indexes,
            selection:
              selection?.kind === 'text'
                ? {
                    ...selection,
                    anchor: fill(selection.anchor, -1),
                    focus: fill(selection.focus, -1),
                  }
                : selection,
          };
        })
      );
      onCleanup(() => STATES.delete(getEditorRuntimeOwner(editor)));
    },
  });
};
