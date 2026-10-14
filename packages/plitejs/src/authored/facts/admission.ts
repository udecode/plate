import {
  createInternalDocumentChange,
  DocumentChange,
  getInternalDocumentChangeRanges,
  getInternalDocumentRootChange,
  valueRoot,
} from '../../core/change/document-change';
import type { DocumentIndex } from '../../core/change/document-index';
import type { RootChange } from '../../core/change/root-change';
import type { JsonEditorValue } from '../../core/change/tokens';
import type { DocumentAdmission } from '../../core/document-admission';
import { EditorMissingReferenceError } from '../../core/missing-reference';
import type { EditorDocumentValue } from '../../interfaces/editor';
import type { Path } from '../../interfaces/path';
import { getDefined } from '../../internal/get-defined';
import { isMetadataRootKey } from '../../internal/root-location';
import {
  AuthoredMarkError,
  createAuthoredMarksValidator,
  isAuthoredSetValued,
  readAuthoredMarks,
} from '../tree/marks';
import { assertEditingDeletionsHeld } from '../tree/resolve';
import { compactClaims, type TopLevelIndicesByRoot } from './compact';
import {
  addCounts,
  contentRootsOf,
  factsOf,
  insertionsIn,
  insertionsOf,
  rememberInsertions,
} from './facts';
import { appendRecords, CONTEXTS_ROOT, VERDICTS_ROOT } from './records';
import { settleValue } from './settle';

const firstChildEndingAfter = (index: DocumentIndex, position: number) => {
  let low = 0;
  let high = index.value.length;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);

    if (index.childPosition([], middle + 1) <= position) low = middle + 1;
    else high = middle;
  }

  return low;
};

/**
 * The top-level children of `root` a change can touch: `from` to `to` after it,
 * and `from` to `beforeTo` before it, since every child outside them is
 * unchanged. One child more on each side covers a change at a boundary.
 */
const changedSpan = (
  change: DocumentChange,
  root: string,
  before: readonly unknown[],
  after: readonly unknown[],
  index: DocumentIndex
) => {
  if (change.createRoots.has(root) || change.deleteRoots.has(root)) {
    return { beforeTo: before.length, from: 0, to: after.length };
  }

  let from = after.length;
  let to = 0;

  for (const range of getInternalDocumentChangeRanges(change, root)) {
    from = Math.min(
      from,
      Math.max(0, firstChildEndingAfter(index, range[2]) - 1)
    );
    to = Math.max(
      to,
      Math.min(after.length, firstChildEndingAfter(index, range[3]) + 1)
    );
  }

  return from >= to
    ? null
    : { beforeTo: before.length - (after.length - to), from, to };
};

const repairOf = (
  after: JsonEditorValue,
  settled: JsonEditorValue,
  scope: TopLevelIndicesByRoot | null,
  indexOf: (root: string) => DocumentIndex
) => {
  const changes = new Map<string, RootChange>();

  for (const [root, nodes] of contentRootsOf(after)) {
    const next = valueRoot(settled, root);

    if (next === nodes) continue;

    let index = indexOf(root);
    let composed: RootChange | null = null;
    const at = scope
      ? (scope.get(root) ?? [])
      : Array.from({ length: nodes.length }, (_, child) => child);

    for (const child of at) {
      if (next[child] === nodes[child]) continue;

      const step = getDefined(
        getInternalDocumentRootChange(
          DocumentChange.between(
            { children: [nodes[child]] },
            { children: [next[child]] },
            { isSetValued: isAuthoredSetValued }
          ),
          'main'
        )
      ).embed(index.length, index.childPosition([], child));

      index = step.apply(index);
      composed = composed ? composed.compose(step) : step;
    }
    if (composed) changes.set(root, composed);
  }

  const contexts = valueRoot(settled, CONTEXTS_ROOT) ?? [];
  const minted = appendRecords(
    after,
    CONTEXTS_ROOT,
    contexts.slice(after.roots?.[CONTEXTS_ROOT]?.length ?? 0)
  );
  const repair = createInternalDocumentChange(changes);

  return minted ? repair.compose(minted) : repair;
};

export const createDocumentMarksValidator = () => {
  const { authorOf, validate } = createAuthoredMarksValidator();

  return {
    authorOf,
    validate: (value: EditorDocumentValue) => {
      const facts = factsOf(value);
      const restsOn = (ctx: string, path: Path) => {
        if (!facts.contexts.has(ctx)) {
          throw new AuthoredMarkError(
            `Review context ${ctx} is missing. Save the whole read.value(), not only its children, so review contexts travel with the text.`,
            path,
            { cause: new EditorMissingReferenceError(ctx) }
          );
        }
      };

      validate(value.children, restsOn);
      for (const [root, children] of Object.entries(value.roots ?? {})) {
        if (!isMetadataRootKey(root)) validate(children, restsOn);
      }
    },
  };
};

export const authoredAdmission: DocumentAdmission = {
  commit: ({ after, before, change, indexOf }) => {
    const previous = insertionsOf(before);
    const counts = new Map(previous.counts);
    const flipped = new Set<string>();
    const roots = contentRootsOf(after);
    const scope = new Map<string, readonly number[]>();
    const beforeFacts = factsOf(before);
    const facts = factsOf(after);

    for (const root of new Set([...previous.roots.keys(), ...roots.keys()])) {
      const old = previous.roots.get(root) ?? [];
      const next = roots.get(root) ?? [];

      if (old === next) continue;

      const span = changedSpan(change, root, old, next, indexOf(root));

      if (!span) continue;
      for (const node of old.slice(span.from, span.beforeTo)) {
        addCounts(counts, insertionsIn(node, beforeFacts), -1, flipped);
      }
      for (const node of next.slice(span.from, span.to)) {
        addCounts(counts, insertionsIn(node, facts), 1, flipped);
      }
      scope.set(
        root,
        Array.from(
          { length: span.to - span.from },
          (_, child) => span.from + child
        )
      );
    }
    rememberInsertions(after, counts);

    const compacted = compactClaims(after, scope);
    const compactedFacts = factsOf(compacted);
    // A decision, or an incarnation a verdict names starting or stopping to
    // insert, can settle claims anywhere.
    const whole =
      before.roots?.[VERDICTS_ROOT] !== after.roots?.[VERDICTS_ROOT] ||
      [...flipped].some((incarnation) => facts.verdicts.has(incarnation));
    const inserting = { has: (incarnation: string) => counts.has(incarnation) };
    const admitted =
      settleValue(
        compacted,
        { ...compactedFacts, insertedIncarnations: () => inserting },
        whole
          ? 'document'
          : new Map([...scope].map(([root, at]) => [root, new Set(at)])),
        { returnsHeld: true }
      ).value ?? compacted;

    return admitted === after
      ? null
      : repairOf(after, admitted, whole ? null : scope, indexOf);
  },
  load: (document) => {
    createDocumentMarksValidator().validate(document);

    const compacted = compactClaims(document);
    const facts = factsOf(compacted);
    const value =
      (facts.verdicts.size === 0
        ? null
        : settleValue(compacted, facts, 'document').value) ?? compacted;

    for (const children of contentRootsOf(value).values()) {
      assertEditingDeletionsHeld(children, readAuthoredMarks);
    }

    return value === document
      ? null
      : {
          change: DocumentChange.between(document, value, {
            isSetValued: isAuthoredSetValued,
          }),
          value,
        };
  },
};
