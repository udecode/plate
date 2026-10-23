import { isDeepStrictEqual } from 'node:util';

import type {
  AuthoredChange,
  AuthoredDecision,
  AuthoredResult,
  AuthoredReview,
  AuthoredView,
} from '../../src/authored';
import { expandContexts } from '../../src/authored/facts/compact';
import {
  type ContextRecord,
  type LandedRecord,
  putContexts,
  putLanded,
  putVerdicts,
  type VerdictRecord,
} from '../../src/authored/facts/records';
import { authoredResolveSchemaOf } from '../../src/authored/resolve-schema';
import { projectAuthoredValue } from '../../src/authored/tree/resolve';
import type { JsonEditorValue } from '../../src/core/change/tokens';
import {
  composeRecordOps,
  getValueRecords,
  recordStoreToJson,
} from '../../src/core/record-store';
import type {
  AnyEditor,
  EditorDocumentRecords,
} from '../../src/interfaces/editor';

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
