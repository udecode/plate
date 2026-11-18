import type { DocumentIndex } from '../../core/change/document-index';
import { jsonEqual } from '../../core/change/json';
import type { RootChange } from '../../core/change/root-change';
import { isElementNode, type JsonNode } from '../../core/change/tokens';
import type { GridRoles } from '../../core/survival';
import { isEditingChange } from '../facts/editing';
import { incarnationOf } from '../facts/records';
import { elementTouches, unrepresentable } from '../refusal';
import type { AuthoredMark } from './marks';

type Claims = (node: unknown) => readonly AuthoredMark[];

const pendingChanges = (node: JsonNode, claims: Claims) =>
  claims(node).flatMap((mark) =>
    (mark.kind === 'insert' || mark.kind === 'delete') &&
    !isEditingChange(mark.change)
      ? [`${mark.kind} ${incarnationOf(mark)}`]
      : []
  );

const partsOf = (
  node: JsonNode,
  role: 'cell' | 'row',
  gridRoles: GridRoles
): JsonNode[] =>
  isElementNode(node)
    ? node.children.flatMap((child) => {
        const childRole = gridRoles.roleOf(child);

        if (childRole === role) return [child];

        return childRole === null ? partsOf(child, role, gridRoles) : [];
      })
    : [];

const holdsPendingColumn = (
  table: JsonNode,
  gridRoles: GridRoles,
  claims: Claims
) =>
  partsOf(table, 'row', gridRoles).some((row) => {
    const rowChanges = new Set(pendingChanges(row, claims));

    return partsOf(row, 'cell', gridRoles).some((cell) =>
      pendingChanges(cell, claims).some((change) => !rowChanges.has(change))
    );
  });

const unplacedInGrid = () =>
  unrepresentable(
    'Review cannot show this table change yet: it adds or removes single cells, changes a span, splits or joins a table part, adds a row beside a pending column change, or moves a block out of a table or row another suggestion adds.',
    'grid'
  );

export const refuseUnplacedGridWrite = ({
  claims,
  frame,
  frameAfter,
  gridRoles,
  moves,
  ownInsertion,
  stored,
  toStored,
  written,
}: Readonly<{
  claims: Claims;
  frame: DocumentIndex;
  frameAfter: DocumentIndex;
  gridRoles: GridRoles;
  moves: boolean;
  ownInsertion: (node: JsonNode) => boolean;
  stored: DocumentIndex;
  toStored: (position: number, assoc: -1 | 1) => number;
  written: RootChange;
}>) => {
  const holders = (place: number) =>
    stored
      .openContextAt(place)
      .filter(
        (range) =>
          range.kind === 'element' && range.from < place && place < range.to
      );
  const partAround = (at: number) =>
    holders(toStored(at, 1))
      .map((range) => stored.node(range.path))
      .findLast((node) => gridRoles.isPart(node));
  const suggestedPartAround = (place: number) =>
    holders(place).find((range) => {
      const part = stored.node(range.path);

      return (
        gridRoles.isPart(part) &&
        !ownInsertion(part) &&
        claims(part).some(
          (mark) => mark.kind === 'insert' && !isEditingChange(mark.change)
        )
      );
    });
  const touches = elementTouches(written, frame, frameAfter, {
    cutEnclosed: false,
  });

  if (moves) {
    const landings = touches.flatMap(({ at, inserted, touch }) =>
      inserted && touch === 'whole' ? [toStored(at, 1)] : []
    );

    for (const { at, inserted, touch } of touches) {
      if (inserted || touch !== 'whole') continue;

      const source = suggestedPartAround(toStored(at, 1));

      if (
        source &&
        !landings.some((place) => source.from < place && place < source.to)
      ) {
        throw unplacedInGrid();
      }
    }
  }

  for (const { at, inserted, props, propsAfter, touch } of touches) {
    const role = gridRoles.roleOf(props);
    const changesPart =
      propsAfter !== undefined &&
      (gridRoles.roleOf(propsAfter) !== role ||
        !jsonEqual(gridRoles.spansOf(props), gridRoles.spansOf(propsAfter)));

    if (role === null && !changesPart) continue;
    if (
      touch === 'boundary' ||
      (touch === 'whole' && role === 'cell') ||
      changesPart
    ) {
      const part = partAround(at);

      if (!part || !ownInsertion(part)) throw unplacedInGrid();
    }
    if (inserted && role === 'row') {
      const grid = partAround(at);

      if (grid && holdsPendingColumn(grid, gridRoles, claims)) {
        throw unplacedInGrid();
      }
    }
  }
};
