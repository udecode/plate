import type { AuthoredVeto } from '../core/authored-veto';
import type { DraftStep } from '../core/change/builder';
import {
  getInternalDocumentChangeEntries,
  valueRoot,
} from '../core/change/document-change';
import { DocumentIndex } from '../core/change/document-index';
import { applyPropertyModifications } from '../core/change/root-change';
import {
  type JsonEditorValue,
  nodeProps,
  PreparedTokenSlice,
} from '../core/change/tokens';
import type { PropertyModification } from '../core/change/transform';
import { EditorRefusalError } from '../core/refusal';
import type { CompiledEditorSchema } from '../core/schema-compiler';

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
   * such as deleting a named root. Only `unrepresentable` refuses an Editing
   * write, such as Enter in a pending join's second half with moved lines
   * between its halves.
   */
  code: 'generated-values' | 'unrepresentable' | 'veto';
  message: string;
  /** Each veto reason the change met, such as `'table'`. */
  reasons: readonly string[];
}>;

/**
 * The refusal of a Suggesting change whose steps touch an element a veto
 * names: an element open around a write, one a removal overlaps, one the
 * write inserts, or one whose properties it edits, before or after the edit.
 */
export const proposalRefusal = (
  steps: readonly DraftStep[],
  before: JsonEditorValue,
  vetoes: readonly AuthoredVeto[]
): AuthoredRefusal | null => {
  const reasons = new Set<string>();
  const check = (element: Readonly<Record<string, unknown>>) => {
    for (const veto of vetoes) {
      const reason = veto(element);

      if (reason !== null) reasons.add(reason);
    }
  };

  for (const step of steps) {
    // A frame's seed and canonical passes are not the writer's edit.
    if (step.origin === 'canonical' || step.origin === 'migration') continue;
    for (const [root, change] of getInternalDocumentChangeEntries(
      step.change
    )) {
      const index =
        step.indexedBefore?.get(root) ??
        DocumentIndex.fromValue(valueRoot(before, root));
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
            const entry = index.nodeStartingAt(at);

            if (entry?.from !== at || entry.kind !== 'element') continue;
            const props = nodeProps(index.node(entry.path));

            check(props);
            check(
              applyPropertyModifications(
                props,
                value as readonly PropertyModification[]
              )
            );
          }
          continue;
        }
        // Only what holds the write, not what it merely borders: a write
        // beside a list stays out of it.
        for (const entry of index.openContextAt(from)) {
          if (
            entry.kind === 'element' &&
            entry.from < from &&
            from < entry.to
          ) {
            check(nodeProps(index.node(entry.path)));
          }
        }
        if (length > 0) {
          for (const entry of index.nodeRangesTouching(from, position)) {
            if (
              entry.kind === 'element' &&
              entry.from < position &&
              from < entry.to
            ) {
              check(nodeProps(index.node(entry.path)));
            }
          }
        }
        if (value instanceof PreparedTokenSlice) {
          for (const token of value.tokens) {
            if (token.kind === 'open' && token.nodeKind === 'element') {
              check(token.props);
            }
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

export const unrepresentable = (message: string) =>
  new EditorRefusalError(
    Object.freeze({
      code: 'unrepresentable',
      message,
      reasons: Object.freeze([]),
    } satisfies AuthoredRefusal),
    message
  );
