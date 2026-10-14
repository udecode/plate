import { isDeepStrictEqual } from 'node:util';

import type {
  AuthoredChange,
  AuthoredDecision,
  AuthoredResult,
  AuthoredReview,
  AuthoredView,
} from '../../src/authored';
import { expandContexts } from '../../src/authored/facts/compact';
import { authoredResolveSchemaOf } from '../../src/authored/resolve-schema';
import { projectAuthoredValue } from '../../src/authored/tree/resolve';
import type { JsonEditorValue } from '../../src/core/change/tokens';
import type { AnyEditor } from '../../src/interfaces/editor';
import { isMetadataRootKey } from '../../src/internal/root-location';

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
        editor.read.value() as JsonEditorValue,
        projection,
        authoredResolveSchemaOf(editor)
      ),
    /** Record the writes `run` makes under one change, whatever the intent. */
    propose: (changeId: string, run: (tx: any) => void) => {
      editor.update((tx: any) => {
        tx.authored.propose({ changeId });
        run(tx);
      });
    },
    setIntent: (intent: 'edit' | 'propose') => {
      editor.api.authored.setView({ intent });
    },
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
  const roots = Object.entries(value.roots ?? {}).flatMap(([root, nodes]) =>
    isMetadataRootKey(root) ? [] : [[root, review(nodes)] as const]
  );

  return {
    children: review(value.children),
    ...(roots.length > 0 ? { roots: Object.fromEntries(roots) } : {}),
  };
};
