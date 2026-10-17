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

/** Why Suggesting refused a change whole, so nothing of it applied. */
export type AuthoredRefusal = Readonly<{
  /**
   * `veto`: the change touches elements a feature's review marks cannot hold
   * yet, named in `reasons`. `generated-values`: the schema constructs
   * property values, which would differ between recording, accepting and
   * rejecting. `unrepresentable`: the review marks cannot hold the change,
   * such as deleting a named root.
   */
  code: 'generated-values' | 'unrepresentable' | 'veto';
  message: string;
  /** Each veto reason the change met, such as `'table'`. */
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

/** The refusal of a Suggesting change whose review form the schema cannot hold. */
export const unrepresentable = (message: string) =>
  new EditorRefusalError(
    Object.freeze({
      code: 'unrepresentable',
      message,
      reasons: Object.freeze([]),
    } satisfies AuthoredRefusal),
    message
  );
