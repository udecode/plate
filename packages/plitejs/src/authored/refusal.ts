import type { AuthoredVeto } from '../core/authored-veto';
import { type DraftStep, UNSCOPED_ORIGINS } from '../core/change/builder';
import { getInternalDocumentChangeEntries } from '../core/change/document-change';
import type { IndexedNodeRange } from '../core/change/document-index';
import { applyPropertyModifications } from '../core/change/root-change';
import { nodeProps, PreparedTokenSlice } from '../core/change/tokens';
import type { PropertyModification } from '../core/change/transform';
import { EditorRefusalError } from '../core/refusal';
import type { CompiledEditorSchema } from '../core/schema-compiler';
import { getDefined } from '../internal/get-defined';

/**
 * Why the review marks cannot hold an edit beside content a pending join
 * shows away from where it is saved. `crosses`: the edit would cover or
 * split such content apart from where it shows. `reordered`: the saved
 * result would show the edited blocks in another order once everything is
 * accepted. `diverged`: it would show other content than the edit wrote.
 * `unaligned`: the preview there has no map to the saved content.
 */
export type UnrepresentableReason =
  | 'crosses'
  | 'diverged'
  | 'reordered'
  | 'unaligned';

/**
 * Why the authored plugin refused a change whole, so nothing of it applied,
 * or refused a view switch.
 */
export type AuthoredRefusal = Readonly<{
  /**
   * `veto`: the change touches elements a feature's review marks cannot hold
   * yet, named in `reasons`. `generated-values`: the schema constructs
   * property values, which would differ between recording, accepting and
   * rejecting. `unrepresentable`: the review marks cannot hold the change,
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
      const before = getDefined(step.indexedBefore.get(root));
      const after = getDefined(step.indexedAfter.get(root));
      const elements: Array<{
        props: Readonly<Record<string, unknown>>;
        touch: 'content' | 'element';
      }> = [];
      const checked = new Map<number, (typeof elements)[number]>();
      const collect = (entry: IndexedNodeRange) => {
        let element = checked.get(entry.from);

        if (!element) {
          const open = change.mapPos(entry.from, 1, 'after');
          const close = change.mapPos(entry.contentTo, 1, 'after');
          const paired = open === null ? undefined : after.nodeStartingAt(open);

          element = {
            props: nodeProps(before.node(entry.path)),
            touch:
              open !== null &&
              close !== null &&
              paired?.kind === 'element' &&
              paired.from === open &&
              paired.contentTo === close
                ? 'content'
                : 'element',
          };
          checked.set(entry.from, element);
          elements.push(element);
        }

        return element;
      };
      let position = 0;

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
              const element = collect(entry);

              element.touch = 'element';
              elements.push({
                props: applyPropertyModifications(
                  element.props,
                  value as readonly PropertyModification[]
                ),
                touch: 'element',
              });
            }
            for (const holder of before.openContextAt(at)) {
              if (holds(holder, at)) collect(holder);
            }
          }
          continue;
        }
        for (const entry of before.openContextAt(from)) {
          if (holds(entry, from)) collect(entry);
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
        if (value instanceof PreparedTokenSlice) {
          for (const token of value.tokens) {
            if (token.kind === 'open' && token.nodeKind === 'element') {
              elements.push({ props: token.props, touch: 'element' });
            }
          }
        }
      }
      for (const { props, touch } of elements) {
        for (const veto of vetoes) {
          const reason = veto(props, touch);

          if (reason !== null) reasons.add(reason);
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

const CONSTRUCTS = new WeakMap<CompiledEditorSchema, boolean>();

/** Whether the schema generates a value for an element property. */
export const constructsValues = (schema: CompiledEditorSchema) => {
  let constructs = CONSTRUCTS.get(schema);

  if (constructs === undefined) {
    constructs = [...schema.properties.byId.values()].some(
      (property) =>
        property.placement === 'element' &&
        typeof property.descriptor.generate === 'function'
    );
    CONSTRUCTS.set(schema, constructs);
  }

  return constructs;
};

export const GENERATED_VALUES_REFUSAL: AuthoredRefusal = Object.freeze({
  code: 'generated-values',
  message:
    'Suggesting is off in an editor whose schema generates property values.',
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

export const unplaced = () =>
  unrepresentable(
    'Cannot write inside the content root of a block whose deletion is pending.'
  );

const MOVED_MESSAGES: Readonly<Record<UnrepresentableReason, string>> = {
  crosses:
    'This edit would cover content a pending join shows elsewhere; decide the join first.',
  diverged:
    'This edit would save something other than what it wrote; decide the pending join first.',
  reordered:
    'This edit would show in another order once everything is accepted; decide the pending join first.',
  unaligned:
    'The preview cannot place this edit beside content a pending join moves.',
};

/** The refusal of an edit beside content a pending join moves. */
export const movedRefusal = (reason: UnrepresentableReason) =>
  unrepresentable(MOVED_MESSAGES[reason], reason);
