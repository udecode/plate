import { getDefined } from '../../internal/get-defined';
import type { DocumentIndex } from './document-index';
import type { RootChange, SectionData } from './root-change';
import { type JsonToken, PreparedTokenSlice, tokenLength } from './tokens';

type Side = 'a' | 'b';

type Wrap = Readonly<{ close: number; open: number; side: Side }>;

type Unit = Readonly<{
  id: number | null;
  kind: 'close' | 'content' | 'open';
  length: number;
}>;

type Tie = Readonly<{
  open: readonly number[];
  units: readonly Unit[];
}>;

const closesWithin = (tokens: readonly JsonToken[], from: number) => {
  let depth = 0;

  for (let at = from; at < tokens.length; at += 1) {
    const { kind } = getDefined(tokens[at]);

    if (kind === 'open') depth += 1;
    else if (kind === 'close') {
      depth -= 1;
      if (depth === 0) return true;
    }
  }

  return false;
};

type Range = Readonly<{ from: number; to: number }>;

const openAt = (document: DocumentIndex, position: number) =>
  document
    .openContextAt(position)
    .filter((entry) => entry.from < position && position < entry.to);

/** @internal */
export const crossed = (document: DocumentIndex, from: number, to: number) => {
  const before = openAt(document, from);
  const after = openAt(document, to);
  let shared = 0;

  while (
    shared < before.length &&
    shared < after.length &&
    before[shared].from === after[shared].from
  ) {
    shared += 1;
  }

  return { closes: before.length - shared, opens: after.slice(shared) };
};

const movedElementsOf = (change: RootChange, document: DocumentIndex) => {
  const moved: Range[] = [];
  const after: Array<Range | null> = [];
  let position = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = getDefined(change.sections[index]);
    const inserted = getDefined(change.sections[index + 1]);

    if (inserted >= 0) {
      const { tokens } = document.slice(position, position + length);
      const opens: number[] = [];
      const closes: number[] = [];
      let at = position;

      for (const token of tokens) {
        if (token.kind === 'open') {
          opens.push(token.nodeKind === 'element' ? at : -1);
        } else if (token.kind === 'close') {
          if (opens.length > 0) opens.pop();
          else if (token.nodeKind === 'element') closes.push(at);
        }
        at += tokenLength(token);
      }

      const lone = opens.filter((open) => open >= 0);

      if (lone.length > 0 !== closes.length > 0) {
        for (const open of lone) {
          const node = document.nodeStartingAt(open);

          if (node) moved.push(node);
        }
        for (const close of closes) {
          const node = document
            .openContextAt(close)
            .find((entry) => entry.to === close + 1);

          if (node) moved.push(node);
        }
      }

      const insert = (change.data[index >> 1] ??
        PreparedTokenSlice.empty) as PreparedTokenSlice;

      for (const [offset, token] of insert.tokens.entries()) {
        if (token.kind === 'open') after.push(null);
        else if (token.kind === 'close') {
          const kept = after.length > 0 ? after.pop() : undefined;
          const next = insert.tokens[offset + 1];

          if (
            kept !== null &&
            token.nodeKind === 'element' &&
            next?.kind === 'open' &&
            next.nodeKind === 'element'
          ) {
            moved.push(
              kept ??
                document
                  .openContextAt(position)
                  .findLast((entry) => entry.to > position) ?? {
                  from: 0,
                  to: document.length,
                }
            );
          }
        }
      }
    } else {
      const { closes, opens } = crossed(document, position, position + length);

      after.length = Math.max(0, after.length - closes);
      after.push(...opens);
    }
    position += length;
  }

  return moved;
};

const unitsOf = (
  change: RootChange,
  document: DocumentIndex,
  side: Side,
  wraps: Map<number, Wrap>,
  nextId: { value: number }
) => {
  const ties = new Map<number, Tie>();
  const moved = movedElementsOf(change, document);
  const stack: Array<number | null> = [];
  const opened = new Map<number, number>();
  let position = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = getDefined(change.sections[index]);
    const inserted = getDefined(change.sections[index + 1]);

    if (inserted < 0) {
      const { closes, opens } = crossed(document, position, position + length);

      stack.length = Math.max(0, stack.length - closes);
      for (const _ of opens) stack.push(null);
      position += length;
      continue;
    }

    const { tokens } = (change.data[index >> 1] ??
      PreparedTokenSlice.empty) as PreparedTokenSlice;
    const open = stack.filter((id) => id !== null);
    const units: Unit[] = [];
    let depth = 0;
    let content = 0;

    for (const [at, token] of tokens.entries()) {
      let edge: Unit | null = null;

      if (token.kind === 'open') {
        const id =
          token.nodeKind === 'element' &&
          !moved.some((range) => range.from <= position && position < range.to)
            ? nextId.value
            : null;

        if (id !== null) {
          nextId.value += 1;
          opened.set(id, position);
        }
        stack.push(id);
        if (depth === 0 && !closesWithin(tokens, at)) {
          edge = { id, kind: 'open', length: 1 };
        }
      } else if (token.kind === 'close') {
        const id = stack.pop() ?? null;
        const from = id === null ? undefined : opened.get(id);

        if (id !== null && from !== undefined) {
          wraps.set(id, { close: position + length, open: from, side });
        }
        if (depth === 0) edge = { id, kind: 'close', length: 1 };
      }
      if (length > 0) continue;
      if (edge) {
        if (content > 0) {
          units.push({ id: null, kind: 'content', length: content });
        }
        content = 0;
        units.push(edge);
        continue;
      }
      if (token.kind === 'open') depth += 1;
      else if (token.kind === 'close') depth -= 1;
      content += tokenLength(token);
    }
    if (content > 0) units.push({ id: null, kind: 'content', length: content });
    if (length === 0 && units.length > 0) ties.set(position, { open, units });
    position += length;
  }

  return ties;
};

type Order = Readonly<{
  a: Readonly<{ data: readonly SectionData[]; sections: readonly number[] }>;
  b: Readonly<{ data: readonly SectionData[]; sections: readonly number[] }>;
  bFirst: (position: number) => boolean;
  merges: (position: number) => boolean;
}>;

const mergeTie = (
  position: number,
  a: Tie,
  b: Tie,
  ties: Readonly<Record<Side, ReadonlyMap<number, Tie>>>,
  wraps: ReadonlyMap<number, Wrap>,
  outer: ReadonlyMap<number, number>,
  first: Side
): Side[] | null => {
  const isNew = (unit: Unit | undefined) =>
    unit?.id !== null && unit?.id !== undefined && wraps.has(unit.id);

  if (
    ![...a.units, ...b.units].some(isNew) ||
    [...a.units, ...b.units].some(
      (unit) => unit.kind !== 'content' && !isNew(unit)
    )
  ) {
    return null;
  }

  const rank = (id: number) => outer.get(id) ?? getDefined(wraps.get(id)).open;
  const stack = [...a.open, ...b.open]
    .filter((id) => wraps.has(id))
    .sort((x, y) => rank(x) - rank(y));
  const spans = (id: number) => getDefined(wraps.get(id)).close > position;
  const contentInside = (side: Side, id: number) => {
    const wrap = getDefined(wraps.get(id));
    const atOpen = ties[side].get(wrap.open)?.units ?? [];
    const atClose = ties[side].get(wrap.close)?.units ?? [];
    const opens = atOpen.findIndex((unit) => unit.id === id);
    const closes = atClose.findIndex((unit) => unit.id === id);

    return (
      (opens !== -1 &&
        atOpen.slice(opens + 1).some((unit) => unit.kind === 'content')) ||
      (closes !== -1 &&
        atClose.slice(0, closes).some((unit) => unit.kind === 'content'))
    );
  };
  const outerOf = (x: number, y: number): Side | null => {
    const left = getDefined(wraps.get(x));
    const right = getDefined(wraps.get(y));

    if (left.close !== right.close) return left.close > right.close ? 'a' : 'b';

    const aInside = contentInside('a', x);
    const bInside = contentInside('b', y);

    if (aInside && bInside) return null;
    if (aInside) return 'a';
    if (bInside) return 'b';

    return first;
  };
  const order: Side[] = [];
  const at = { a: 0, b: 0 };
  const units = { a: a.units, b: b.units };
  const fits = (side: Side) =>
    stack.every(
      (id) =>
        getDefined(wraps.get(id)).side === side ||
        (spans(id) && getDefined(wraps.get(id)).open < position)
    );
  const take = (side: Side) => {
    const unit = getDefined(units[side][at[side]]);

    if (unit.kind === 'open') stack.push(getDefined(unit.id));
    if (unit.kind === 'close') stack.pop();
    at[side] += 1;
    order.push(side);
  };

  while (at.a < units.a.length || at.b < units.b.length) {
    const x = units.a[at.a];
    const y = units.b[at.b];
    const top = stack.at(-1);

    if (x?.kind === 'close' && x.id === top) take('a');
    else if (y?.kind === 'close' && y.id === top) take('b');
    else if (
      x?.kind === 'content' &&
      fits('a') &&
      !(y?.kind === 'content' && fits('b') && first === 'b')
    ) {
      take('a');
    } else if (y?.kind === 'content' && fits('b')) take('b');
    else if (x?.kind === 'open' && y?.kind === 'open') {
      const side = outerOf(getDefined(x.id), getDefined(y.id));

      if (!side) return null;
      take(side);
    } else if (x?.kind === 'open') take('a');
    else if (y?.kind === 'open') take('b');
    else if (x && !y) take('a');
    else if (y && !x) take('b');
    else return null;
  }

  return order;
};

const splitAt = (
  change: RootChange,
  ties: ReadonlyMap<number, Tie>,
  merged: ReadonlySet<number>
) => {
  const sections: number[] = [];
  const data: SectionData[] = [];
  let position = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = getDefined(change.sections[index]);
    const inserted = getDefined(change.sections[index + 1]);
    const tie =
      length === 0 && merged.has(position) ? ties.get(position) : undefined;

    if (tie) {
      const slice = change.data[index >> 1] as PreparedTokenSlice;
      let from = 0;

      for (const unit of tie.units) {
        sections.push(0, unit.length);
        data.push(slice.slice(from, from + unit.length));
        from += unit.length;
      }
    } else {
      sections.push(length, inserted);
      data.push(change.data[index >> 1] ?? null);
    }
    position += length;
  }

  return { data, sections };
};

/** @internal */
export const wrapFidelity = (
  changeA: RootChange,
  changeB: RootChange,
  document: DocumentIndex,
  first: Side
): Order | null => {
  const insertsAt = (change: RootChange) => {
    const at = new Set<number>();
    let position = 0;

    for (let index = 0; index < change.sections.length; index += 2) {
      const length = getDefined(change.sections[index]);

      if (length === 0 && getDefined(change.sections[index + 1]) >= 0) {
        at.add(position);
      }
      position += length;
    }

    return at;
  };
  const insertsA = insertsAt(changeA);

  if (
    insertsA.size === 0 ||
    ![...insertsAt(changeB)].some((at) => insertsA.has(at))
  ) {
    return null;
  }

  const wraps = new Map<number, Wrap>();
  const nextId = { value: 0 };
  const ties = {
    a: unitsOf(changeA, document, 'a', wraps, nextId),
    b: unitsOf(changeB, document, 'b', wraps, nextId),
  };
  const orders = new Map<number, Side[]>();
  const outer = new Map<number, number>();
  const positions = [...ties.a.keys()]
    .filter((position) => ties.b.has(position))
    .sort((x, y) => x - y);

  for (const position of positions) {
    const order = mergeTie(
      position,
      getDefined(ties.a.get(position)),
      getDefined(ties.b.get(position)),
      ties,
      wraps,
      outer,
      first
    );

    if (!order) continue;
    orders.set(position, order);

    const at = { a: 0, b: 0 };

    for (const side of order) {
      const unit = getDefined(
        getDefined(ties[side].get(position)).units[at[side]]
      );

      at[side] += 1;
      if (unit.kind === 'open' && unit.id !== null) {
        outer.set(unit.id, position + outer.size / 1e6);
      }
    }
  }

  if (orders.size === 0) return null;

  const merged = new Set(orders.keys());
  const cursor = new Map<number, number>();

  return {
    a: splitAt(changeA, ties.a, merged),
    b: splitAt(changeB, ties.b, merged),
    bFirst: (position) => {
      const order = getDefined(orders.get(position));
      const next = cursor.get(position) ?? 0;

      cursor.set(position, next + 1);

      return order[next] === 'b';
    },
    merges: (position) => orders.has(position),
  };
};
