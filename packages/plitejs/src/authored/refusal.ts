import type { AuthoredTouch, AuthoredVeto } from '../core/authored-veto';
import { type DraftStep, UNSCOPED_ORIGINS } from '../core/change/builder';
import {
  type DocumentChange,
  getInternalDocumentChangeEntries,
  getInternalDocumentChangeRanges,
} from '../core/change/document-change';
import type {
  DocumentIndex,
  IndexedNodeRange,
} from '../core/change/document-index';
import {
  applyPropertyModifications,
  type RootChange,
} from '../core/change/root-change';
import {
  isElementNode,
  nodeProps,
  PreparedTokenSlice,
} from '../core/change/tokens';
import type { PropertyModification } from '../core/change/transform';
import { EditorRefusalError } from '../core/refusal';
import {
  type CompiledEditorSchema,
  isSupportedGeneratedElementProperty,
} from '../core/schema-compiler';
import { getDefined } from '../internal/get-defined';

/**
 * Why the review marks cannot hold an edit. The first four concern content a
 * pending join shows away from where it is saved. `crosses`: the edit would
 * cover or split such content apart from where it shows. `reordered`: the
 * saved result would show the edited blocks in another order once everything
 * is accepted. `diverged`: it would show other content than the edit wrote.
 * `unaligned`: the preview there has no map to the saved content. `grid`: the
 * edit acts inside a table or row whose deletion is pending, or joins two
 * lines across one, or a suggestion would add or remove single cells, change
 * a span, split or join a table part, or add a row beside a pending column
 * change.
 */
export type UnrepresentableReason =
  | 'crosses'
  | 'diverged'
  | 'grid'
  | 'reordered'
  | 'unaligned';

/**
 * Why the authored plugin refused a change whole, so nothing of it applied,
 * or refused a view switch.
 */
export type AuthoredRefusal = Readonly<{
  /**
   * `veto`: the change touches elements a feature's review marks cannot hold
   * yet, named in `reasons`. `generated-values`: the schema generates a
   * property value a suggestion cannot store, such as one whose target reads
   * its parent, so recording, accepting and rejecting could each build a
   * different one. `unrepresentable`: the review marks cannot hold the change,
   * such as deleting a named root or writing inside the root of a block
   * whose deletion is pending. Only `unrepresentable` refuses an Editing
   * write, such as Enter in a pending join's second half with moved lines
   * between its halves.
   */
  code: 'generated-values' | 'unrepresentable' | 'veto';
  message: string;
  /**
   * Each veto reason the change met, such as `'table'`, or the
   * {@link UnrepresentableReason} an unrepresentable edit met.
   */
  reasons: readonly string[];
}>;

const holds = (entry: IndexedNodeRange, at: number) =>
  entry.kind === 'element' && entry.from < at && at < entry.to;

const enclosedSpanOf = (change: RootChange) => {
  let from = 0;
  let to = 0;
  let first = true;
  let position = 0;

  for (let section = 0; section < change.sections.length; section += 2) {
    const length = change.sections[section];

    if (change.sections[section + 1] >= 0) {
      if (first) from = position + length;
      first = false;
      to = position;
    }
    position += length;
  }

  return { from, to };
};

type Touched = {
  at: number;
  inserted: boolean;
  props: Readonly<Record<string, unknown>>;
  propsAfter?: Readonly<Record<string, unknown>>;
  touch: AuthoredTouch;
};

const cutEnclosedElements = (
  change: RootChange,
  before: DocumentIndex,
  cut: (entry: IndexedNodeRange) => void
) => {
  const span = enclosedSpanOf(change);

  for (const entry of before.nodeRangesTouching(span.from, span.to)) {
    if (
      entry.kind === 'element' &&
      span.from <= entry.from &&
      entry.to <= span.to
    ) {
      cut(entry);
    }
  }
};

export const elementTouches = (
  change: RootChange,
  before: DocumentIndex,
  after: DocumentIndex,
  { cutEnclosed }: { cutEnclosed: boolean }
): ReadonlyArray<Readonly<Touched>> => {
  const removed: Array<[number, number]> = [];
  let position = 0;

  for (let section = 0; section < change.sections.length; section += 2) {
    const length = change.sections[section];
    const from = position;

    position += length;
    if (change.sections[section + 1] < 0 || length === 0) continue;

    const last = removed.at(-1);

    if (last?.[1] === from) last[1] = position;
    else removed.push([from, position]);
  }

  const removing = (from: number, to: number) =>
    removed.find(([start, end]) => start <= from && to <= end);
  const touchOf = (entry: IndexedNodeRange): AuthoredTouch => {
    const span = removing(entry.from, entry.to);

    if (span) {
      return before
        .openContextAt(entry.from)
        .some(
          (around) =>
            around.kind === 'element' &&
            around.from < entry.from &&
            span[0] <= around.from &&
            around.to <= span[1]
        )
        ? 'inside'
        : 'whole';
    }

    const open = change.mapPos(entry.from, 1, 'after');
    const close = change.mapPos(entry.contentTo, 1, 'after');
    const paired = open === null ? undefined : after.nodeStartingAt(open);

    return paired?.kind === 'element' &&
      paired.from === open &&
      paired.contentTo === close
      ? 'content'
      : 'boundary';
  };
  const touched: Touched[] = [];
  const checked = new Map<number, Touched>();
  const collect = (entry: IndexedNodeRange) => {
    let element = checked.get(entry.from);

    if (!element) {
      element = {
        at: entry.from,
        inserted: false,
        props: nodeProps(before.node(entry.path)),
        touch: touchOf(entry),
      };
      checked.set(entry.from, element);
      touched.push(element);
    }

    return element;
  };
  const cut = (entry: IndexedNodeRange) => {
    const element = collect(entry);

    if (element.touch === 'content') element.touch = 'boundary';
  };

  if (cutEnclosed) cutEnclosedElements(change, before, cut);

  const opens: Array<{
    at: number;
    closedInSlice: boolean;
    parent?: number;
    props?: Readonly<Record<string, unknown>>;
  }> = [];

  position = 0;
  for (let section = 0; section < change.sections.length; section += 2) {
    const length = change.sections[section];
    const inserted = change.sections[section + 1];
    const value = change.data[section / 2];
    const from = position;

    position += length;
    if (inserted === -1) continue;
    if (inserted === -2) {
      for (let at = from; at < position; at++) {
        const entry = before.nodeStartingAt(at);

        if (entry?.from === at && entry.kind === 'element') {
          const props = nodeProps(before.node(entry.path));

          touched.push({
            at,
            inserted: false,
            props,
            propsAfter: applyPropertyModifications(
              props,
              value as readonly PropertyModification[]
            ),
            touch: 'properties',
          });
        }
        for (const holder of before.openContextAt(at)) {
          if (holds(holder, at)) collect(holder);
        }
      }
      continue;
    }

    const open = before
      .openContextAt(from)
      .filter((entry) => entry.from < from && from < entry.to);

    for (const entry of open) {
      if (entry.kind === 'element') collect(entry);
    }
    if (length > 0) {
      for (const entry of before.nodeRangesTouching(from, position)) {
        if (
          entry.kind === 'element' &&
          entry.from < position &&
          from < entry.to
        ) {
          collect(entry);
        }
      }
    }
    if (!(value instanceof PreparedTokenSlice)) continue;

    const stack: number[] = [];

    for (const token of value.tokens) {
      if (token.kind === 'open') {
        stack.push(opens.length);
        opens.push({
          at: from,
          closedInSlice: false,
          parent: stack.at(-2),
          props: token.nodeKind === 'element' ? token.props : undefined,
        });
      } else if (token.kind === 'close') {
        const index = stack.pop();

        if (index !== undefined) opens[index].closedInSlice = true;
      }
    }
  }
  for (const { at, closedInSlice, parent, props } of opens) {
    if (!props) continue;

    touched.push({
      at,
      inserted: true,
      props,
      touch: closedInSlice
        ? parent !== undefined && opens[parent].closedInSlice
          ? 'inside'
          : 'whole'
        : 'boundary',
    });
  }

  return touched;
};

export const proposalRefusal = (
  steps: readonly DraftStep[],
  vetoes: readonly AuthoredVeto[]
): AuthoredRefusal | null => {
  const reasons = new Set<string>();

  for (const step of steps) {
    if (UNSCOPED_ORIGINS.has(step.origin)) continue;
    for (const [root, change] of getInternalDocumentChangeEntries(
      step.change
    )) {
      for (const { props, propsAfter, touch } of elementTouches(
        change,
        getDefined(step.indexedBefore.get(root)),
        getDefined(step.indexedAfter.get(root)),
        { cutEnclosed: step.origin === 'wrap' || step.origin === 'unwrap' }
      )) {
        for (const element of propsAfter ? [props, propsAfter] : [props]) {
          for (const veto of vetoes) {
            const reason = veto(element, touch);

            if (reason !== null) reasons.add(reason);
          }
        }
      }
    }
  }

  if (reasons.size === 0) return null;

  return Object.freeze({
    code: 'veto',
    message: `Suggesting cannot change ${[...reasons].join(', ')} yet.`,
    reasons: Object.freeze([...reasons]),
  });
};

const STORES = new WeakMap<CompiledEditorSchema, boolean>();

export const storesGeneratedValues = (schema: CompiledEditorSchema) => {
  let stores = STORES.get(schema);

  if (stores === undefined) {
    const generated = [...schema.properties.byId.values()].filter(
      (property) => typeof property.descriptor.generate === 'function'
    );
    const elements = generated.filter(
      (property) => property.placement === 'element'
    );
    const generatesTextBesideElements = elements.length !== generated.length;

    stores =
      elements.length === 0 ||
      (!generatesTextBesideElements &&
        elements.every(isSupportedGeneratedElementProperty));
    STORES.set(schema, stores);
  }

  return stores;
};

export const GENERATED_VALUES_REFUSAL: AuthoredRefusal = Object.freeze({
  code: 'generated-values',
  message:
    'Suggesting is off in an editor whose schema generates a property value a suggestion cannot store.',
  reasons: Object.freeze([]),
});

export const unrepresentable = (
  message: string,
  reason?: UnrepresentableReason
): EditorRefusalError =>
  new EditorRefusalError(
    Object.freeze({
      code: 'unrepresentable',
      message,
      reasons: Object.freeze(reason ? [reason] : []),
    } satisfies AuthoredRefusal),
    message
  );

export const splitOneTextRefusal = (
  change: DocumentChange,
  indexes: ReadonlyMap<string, DocumentIndex>,
  oneText: (type: string) => boolean
) => {
  for (const [root, index] of indexes) {
    for (const range of getInternalDocumentChangeRanges(change, root)) {
      for (const { kind, path } of index.nodeRangesTouching(
        range[2],
        range[3]
      )) {
        if (kind !== 'element') continue;

        const node = index.node(path);

        if (
          isElementNode(node) &&
          node.children.length > 1 &&
          typeof node.type === 'string' &&
          oneText(node.type)
        ) {
          return unrepresentable(
            `Suggesting cannot mark part of the text in "${node.type}", which holds one text.`
          );
        }
      }
    }
  }

  return null;
};

export const unplaced = () =>
  unrepresentable(
    'Cannot write inside the content root of a block whose deletion is pending.'
  );

const REASON_MESSAGES: Readonly<Record<UnrepresentableReason, string>> = {
  crosses:
    'This edit would cover content a pending join shows elsewhere; decide the join first.',
  diverged:
    'This edit would save something other than what it wrote; decide the pending join first.',
  grid: 'This edit is inside or across a table or row whose deletion is pending; decide that table or row first.',
  reordered:
    'This edit would show in another order once everything is accepted; decide the pending join first.',
  unaligned:
    'The preview cannot place this edit beside content a pending join moves.',
};

export const unrepresentableFor = (reason: UnrepresentableReason) =>
  unrepresentable(REASON_MESSAGES[reason], reason);
