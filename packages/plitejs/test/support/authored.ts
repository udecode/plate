import { isDeepStrictEqual } from 'node:util';

import type {
  AuthoredChange,
  AuthoredDecision,
  AuthoredResult,
  AuthoredReview,
  AuthoredView,
} from '../../src/authored';
import {
  authoredAdmission,
  settleShownValues,
} from '../../src/authored/facts/admission';
import { expandContexts } from '../../src/authored/facts/compact';
import {
  type ContextRecord,
  type LandedRecord,
  putContexts,
  putLanded,
  putVerdicts,
  type VerdictRecord,
} from '../../src/authored/facts/records';
import { getReviewLedger } from '../../src/authored/ledger/ledger';
import { authoredResolveSchemaOf } from '../../src/authored/resolve-schema';
import { ShownBook } from '../../src/authored/tree/readiness';
import { storesSpares } from '../../src/authored/tree/reserves';
import { projectAuthoredValue } from '../../src/authored/tree/resolve';
import { valueRootIndex } from '../../src/core/change/document-change';
import type { DocumentIndex } from '../../src/core/change/document-index';
import type { JsonEditorValue } from '../../src/core/change/tokens';
import { registerEditorDraftGuard } from '../../src/core/document-recorder';
import { getEditorRuntimeOwner } from '../../src/core/editor-runtime';
import { getCompiledEditorSchema } from '../../src/core/plugin-registry';
import {
  composeRecordOps,
  getValueRecords,
  recordStoreToJson,
} from '../../src/core/record-store';
import type {
  AnyEditor,
  EditorDocumentRecords,
  EditorDocumentValue,
} from '../../src/interfaces/editor';
import { getDefined } from '../../src/internal/get-defined';

export const reviewRecords = ({
  contexts = [],
  landed = [],
  verdicts = [],
}: Readonly<{
  contexts?: readonly ContextRecord[];
  landed?: readonly LandedRecord[];
  verdicts?: readonly VerdictRecord[];
}>): EditorDocumentRecords =>
  Object.fromEntries(
    [
      ...composeRecordOps(
        composeRecordOps(putContexts(contexts), putVerdicts(verdicts)),
        putLanded(landed)
      ),
    ].map(([set, writes]) => [
      set,
      Object.fromEntries(
        [...writes].map(([id, json]) => [id, JSON.parse(json ?? 'null')])
      ),
    ])
  );

/** A value's records as JSON, whether it holds them as a field or beside it. */
export const recordsOf = (value: object): EditorDocumentRecords =>
  recordStoreToJson(getValueRecords(value));

/** The review contexts a document stores, each with its member's fields. */
export const storedContexts = (value: object) =>
  Object.entries(recordsOf(value)['authored-contexts'] ?? {}).map(
    ([ctx, record]) => {
      const { base, member } = record as Readonly<{
        base?: string;
        member: Readonly<{
          at: number;
          author: string;
          change: string;
          inc?: string;
        }>;
      }>;

      return { ...member, base, ctx };
    }
  );

type IdDecision = Readonly<{
  action: AuthoredDecision['action'];
  changes: readonly string[];
}>;

type AuthoredTestEditor = AnyEditor & {
  api: { authored: { setView: (view: AuthoredView) => void } };
  read: {
    authored: {
      change: (id: string) => AuthoredChange | null;
      reviewOf: (node: unknown) => AuthoredReview;
    };
  };
  update: {
    authored: {
      decide: (decisions: readonly AuthoredDecision[]) => AuthoredResult;
      withdraw: (changes: readonly AuthoredChange[]) => AuthoredResult;
    };
  };
};

/**
 * Decide, propose and project by change id, the way tests name changes. An
 * id the document does not hold decides nothing, such as a typing step that
 * joined its author's pending insertion and so marks nothing of its own.
 */
export const authoredTestApi = (input: AnyEditor) => {
  const editor = input as AuthoredTestEditor;

  return {
    decide: (decisions: IdDecision | readonly IdDecision[]) =>
      editor.update.authored.decide(
        [decisions].flat().map((decision) => ({
          action: decision.action,
          changes: decision.changes.flatMap(
            (id) => editor.read.authored.change(id) ?? []
          ),
        }))
      ),
    project: (projection: 'accepted' | 'proposed') =>
      projectAuthoredValue(
        editor.read.value(),
        projection,
        authoredResolveSchemaOf(editor)
      ),
    /** Record the writes `run` makes under one change, whatever the intent. */
    propose: (changeId: string, run: (tx: any) => void) => {
      editor.update((tx) => {
        tx.authored.propose({ changeId });
        run(tx);
      });
    },
    setIntent: (intent: 'edit' | 'propose') => {
      editor.api.authored.setView({ intent });
    },
    withdraw: (ids: readonly string[]) =>
      editor.update.authored.withdraw(
        ids.flatMap((id) => editor.read.authored.change(id) ?? [])
      ),
  };
};

type Node = Readonly<Record<string, unknown>> & {
  children?: readonly Node[];
  text?: string;
};

/**
 * The editor's children with each node's insertions written out on it, as a
 * value without review contexts stores them, so a test can compare them or
 * load them into another editor.
 */
export const expandedChildren = (input: { read: { value: () => unknown } }) =>
  expandContexts(input.read.value() as JsonEditorValue).children;

const withoutText = ({ text: _text, ...rest }: Node) => rest;

export const reviewedValue = (input: AnyEditor) => {
  const editor = input as AuthoredTestEditor;
  const review = (nodes: readonly Node[]): Node[] => {
    const next: Node[] = [];

    for (const node of nodes) {
      const { hidden, marks } = editor.read.authored.reviewOf(node);

      if (hidden) continue;

      const { authored: _authored, ...rest } = node;
      const reviewed: Node = {
        ...rest,
        ...(marks.length > 0 ? { authored: marks } : {}),
        ...(node.children ? { children: review(node.children) } : {}),
      };
      const last = next.at(-1);

      if (
        last?.text !== undefined &&
        reviewed.text !== undefined &&
        isDeepStrictEqual(withoutText(last), withoutText(reviewed))
      ) {
        next[next.length - 1] = { ...last, text: last.text + reviewed.text };
      } else {
        next.push(reviewed);
      }
    }

    return next.length === 0 && nodes.some((node) => node.text !== undefined)
      ? [{ text: '' }]
      : next;
  };
  const value = editor.read.value() as {
    children: readonly Node[];
    roots?: Readonly<Record<string, readonly Node[]>>;
  };
  const roots = Object.entries(value.roots ?? {}).map(
    ([root, nodes]) => [root, review(nodes)] as const
  );

  return {
    children: review(value.children),
    ...(roots.length > 0 ? { roots: Object.fromEntries(roots) } : {}),
  };
};

/** By owner editor, where a watched editor's guards report what they find. */
const WATCHED = new WeakMap<object, string[]>();
const { settle } = authoredAdmission;

// Each watched commit settles a second time through a fresh record, which
// reads the whole document, and both must write the same document.
Object.assign(authoredAdmission, {
  settle: (...args: Parameters<NonNullable<typeof settle>>) => {
    const settled = getDefined(settle)(...args);
    const [value, schema, commit] = args;
    const found = commit && WATCHED.get(getEditorRuntimeOwner(commit.editor));

    if (found && storesSpares(schema)) {
      const fresh = settleShownValues(value, schema, commit, null);
      const [ours, theirs] = [settled, fresh].map((change) =>
        JSON.stringify(change ? change.apply(value) : value)
      );

      if (ours !== theirs) {
        found.push(
          `the record settled ${ours} where a fresh one settled ${theirs}`
        );
      }
    }

    return settled;
  },
});

export const staleRecordOf = <E extends AnyEditor>(
  editor: E,
  value: EditorDocumentValue
) => {
  const kept = getReviewLedger(getEditorRuntimeOwner(editor))?.shown;
  const ours = kept?.fingerprint(value);

  if (!kept || ours === null) return null;

  const fresh = new ShownBook();
  const indexes = new Map<string, DocumentIndex>();

  fresh.settled(value, getCompiledEditorSchema(editor), (root) => {
    const index = indexes.get(root) ?? valueRootIndex(value, root);

    indexes.set(root, index);

    return index;
  });

  const theirs = fresh.fingerprint(value);

  return ours === theirs
    ? null
    : `the ledger's record ${ours} where a fresh one holds ${theirs}`;
};

/**
 * Watches editors for a commit after which settling the whole document would
 * still change it, for a commit the record settles otherwise than a fresh
 * record would, and for a commit after which the ledger's record differs
 * from one built from the committed document: `guard` watches an editor, and
 * `take` returns and forgets what such commits stored.
 */
export const unsettledCommits = () => {
  const found: string[] = [];

  return {
    guard: <E extends AnyEditor>(editor: E) => {
      WATCHED.set(getEditorRuntimeOwner(editor), found);
      registerEditorDraftGuard(editor, (value) => {
        const schema = getCompiledEditorSchema(editor);

        if (settle?.(value, schema, null)) {
          found.push(JSON.stringify(value.children));
        }

        const stale = staleRecordOf(editor, value);

        if (stale) found.push(stale);
      });

      return editor;
    },
    take: () => found.splice(0),
  };
};
