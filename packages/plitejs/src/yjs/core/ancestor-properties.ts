import type { DocumentIndex } from '../../core/change/document-index';
import {
  addSection,
  RootChange,
  type SectionData,
} from '../../core/change/root-change';
import type { PropertyModification } from '../../core/change/transform';

/** The kept element whose property edits a commit makes beside its children. */
export type PeeledProperties = Readonly<{
  path: readonly number[];
}>;

/**
 * Split out each property edit on the opening token of an element whose
 * content holds another of the change's replacements, so the element's own
 * properties and its children can lower apart. A retype stays, since child
 * encoding reads the type. `inner.compose(outer)` is the change.
 */
export const splitAncestorPropertyEdits = (
  change: RootChange,
  document: DocumentIndex
): Readonly<{
  inner: RootChange;
  outer: RootChange;
  peeled: readonly PeeledProperties[];
}> | null => {
  const replaced: Array<readonly [number, number]> = [];
  let position = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];

    if (change.sections[index + 1] >= 0) {
      replaced.push([position, position + length]);
    }
    position += length;
  }
  if (replaced.length === 0) return null;

  const inner: number[] = [];
  const innerData: SectionData[] = [];
  const outer: number[] = [];
  const outerData: SectionData[] = [];
  const peeled: PeeledProperties[] = [];

  position = 0;
  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];
    const value = change.data[index / 2] ?? null;
    const entry =
      inserted === -2 ? document.nodeStartingAt(position) : undefined;
    const peel =
      entry?.kind === 'element' &&
      !(value as readonly PropertyModification[]).some(
        ({ key }) => key === 'type'
      ) &&
      replaced.some(
        ([from, to]) => entry.contentFrom <= from && to <= entry.contentTo
      );

    if (peel) {
      peeled.push({ path: entry.path });
      addSection(inner, innerData, length, inserted, value);
      addSection(outer, outerData, length, -1, null);
    } else {
      addSection(inner, innerData, length, -1, null);
      addSection(outer, outerData, length, inserted, value);
    }
    position += length;
  }

  return peeled.length === 0
    ? null
    : {
        inner: RootChange.fromSections(inner, innerData),
        outer: RootChange.fromSections(outer, outerData),
        peeled,
      };
};
