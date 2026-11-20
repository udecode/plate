import type { NodeKey } from '../../../facade';
import type { InkCopy, InkCopyPlace, InkMark } from '../../../features/ink/lib';
import {
  type InkBox,
  type InkPlacement,
  placeMark,
} from '../../../features/ink/lib/inkMatch.internal';
import {
  type InkIndexedMark,
  type InkMarkSign,
  readInkIndexedMark,
  readInkSign,
} from '../../../features/ink/lib/inkPlaces.internal';
import type { Editor } from '../../core';
import type { InkSign } from './InkLayer';
import { createInkLayouts } from './inkLayout.internal';
import {
  type InkBand,
  type InkLayerOrigin,
  type InkMeasuredBlock,
  inkBoxOf,
  inkTextBlockOf,
  inkWordBoxes,
  sameInkBox,
} from './inkMeasure.internal';
import { InkPlugin } from './InkPlugin';
import type { InkLayoutChange } from './inkWatch.internal';

export type InkPlaced = Readonly<{
  bottom: number;
  ink: ReadonlyArray<Readonly<{ dx: number; dy: number; mark: InkMark }>>;
  signs: ReadonlyArray<
    Readonly<{ id: string; left: number; sign: InkSign; top: number }>
  >;
}>;

export const NOTHING_PLACED: InkPlaced = { bottom: 0, ink: [], signs: [] };

type Places = ReadonlyArray<InkCopyPlace | undefined>;

type Witness = Readonly<{
  boxFromFirst: InkBox;
  key: NodeKey;
  lines: InkMeasuredBlock['lines'];
}>;

type Decided = Readonly<{
  place: InkCopyPlace | undefined;
  placement: InkPlacement;
}>;

type Held = Decided &
  Readonly<{
    bandFromFirst: InkBand;
    crossing: number;
    entry: InkIndexedMark;
    firstKey: NodeKey;
    firstTop: number;
    width: number;
    witnesses: readonly Witness[];
  }>;

type Decide = (mark: InkMark, entry: InkIndexedMark) => Decided;

export type InkAudit = (expired: () => boolean) => boolean;

type InkInputs = Readonly<{
  band: InkBand;
  crossing: number;
  first: InkMeasuredBlock | undefined;
  keys: readonly NodeKey[];
  live: ReadonlyArray<InkMeasuredBlock | undefined>;
  near: readonly InkMeasuredBlock[];
}>;

const metrics = { decided: 0 };

export const getInkPlacementMetrics = () => Object.freeze({ ...metrics });

const crosses = (box: InkBox, { from, to }: InkBand) =>
  box.top <= to && box.top + box.height >= from;

const inkInputs = (
  mark: InkMark,
  copies: readonly InkCopy[],
  places: Places,
  measure: (key: NodeKey) => InkMeasuredBlock | undefined,
  candidatesBetween: (
    from: number,
    to: number
  ) => ReadonlyArray<Readonly<{ box: InkBox; key: NodeKey }>>
): InkInputs => {
  const live = places.map((place) =>
    place && place.kind !== 'gone' ? measure(place.key) : undefined
  );
  const at = live.findIndex((block) => block !== undefined);
  const first = live[at];
  const reach =
    mark.brush.size / 2 +
    Math.max(
      0,
      ...copies.flatMap((copy) => copy.lines.map((line) => line.height))
    );
  const shift = first ? first.box.top - mark.blocks[at].top : 0;
  const ys = mark.samples.map(([, y]) => y + shift);
  const band = { from: Math.min(...ys) - reach, to: Math.max(...ys) + reach };
  const marked = new Set(
    places.flatMap((place) =>
      place && place.kind !== 'gone' ? [place.key] : []
    )
  );
  const crossing = candidatesBetween(band.from, band.to).filter(({ box }) =>
    crosses(box, band)
  );
  const others = crossing.flatMap(({ key }) => (marked.has(key) ? [] : [key]));

  return {
    band,
    crossing: crossing.length,
    first,
    keys: [...marked, ...others],
    live,
    near: others.flatMap((key) => measure(key) ?? []),
  };
};

const placeInkMarks = (
  view: Editor,
  editable: HTMLElement,
  origin: InkLayerOrigin,
  marks: readonly InkMark[],
  entryOf: (mark: InkMark) => InkIndexedMark | undefined,
  signOf: (mark: InkMark) => InkMarkSign | undefined,
  decide: Decide
): InkPlaced => {
  const editableBox = inkBoxOf(editable, origin);
  const style = getComputedStyle(editable);
  const rails = {
    ltr:
      editableBox.left +
      editableBox.width -
      (Number.parseFloat(style.paddingRight) || 0),
    rtl: editableBox.left,
  };
  const startTop = editableBox.top + (Number.parseFloat(style.paddingTop) || 0);
  const anchors = new Map<NodeKey, InkBox | undefined>();
  const anchorBox = (key: NodeKey) => {
    if (!anchors.has(key)) {
      const element = view.api.dom.resolveDOMNode(key);

      anchors.set(key, element ? inkBoxOf(element, origin) : undefined);
    }

    return anchors.get(key);
  };
  const anchorOf = (place: InkCopyPlace | undefined) => {
    if (place?.kind === 'live' || place?.kind === 'changed') {
      return { id: place.key, top: anchorBox(place.key)?.top ?? startTop };
    }

    const beside = place?.kind === 'gone' ? place.beside : undefined;

    if (!beside || beside.at === 'start') return { id: 'start', top: startTop };

    const box = anchorBox(beside.key);

    return {
      id: `${beside.at}:${beside.key}`,
      top: box ? box.top + (beside.at === 'after' ? box.height : 0) : startTop,
    };
  };
  const ink: Array<InkPlaced['ink'][number]> = [];
  const signs = new Map<
    string,
    { left: number; marks: string[]; state: InkSign['state']; top: number }
  >();

  for (const mark of marks) {
    const entry = entryOf(mark);

    if (!entry) continue;

    const kept = signOf(mark);
    let state: InkSign['state'] | undefined = kept?.state;
    let place = kept?.place;

    if (!kept) {
      const decided = decide(mark, entry);
      const { placement } = decided;

      if (placement.type === 'ink') {
        ink.push({ dx: placement.dx, dy: placement.dy, mark });
      }
      state = placement.type === 'sign' ? placement.reason : placement.sign;
      ({ place } = decided);
    }
    if (!state) continue;

    const anchor = anchorOf(place);
    const id = `${mark.direction}|${anchor.id}|${state}`;
    const sign = signs.get(id) ?? {
      left: rails[mark.direction],
      marks: [],
      state,
      top: anchor.top,
    };

    sign.marks.push(mark.id);
    signs.set(id, sign);
  }

  return {
    bottom: editable.offsetTop + editable.offsetHeight,
    ink,
    signs: [...signs].map(([id, { marks: ofSign, state, ...place }]) => ({
      ...place,
      id,
      sign: { marks: ofSign, state },
    })),
  };
};

const LOWEST = '[data-editor-node="element"]:not([data-editor-inline])';

const AUTO = new Set(['', 'auto']);

const stacksChildren = (style: CSSStyleDeclaration) =>
  !/flex|grid|table/.test(style.display) &&
  AUTO.has(style.columnCount) &&
  AUTO.has(style.columnWidth);

const firstEndingBelow = (children: HTMLCollection, y: number) => {
  let from = 0;
  let to = children.length;

  while (from < to) {
    const mid = (from + to) >> 1;

    if (children[mid].getBoundingClientRect().bottom < y) from = mid + 1;
    else to = mid;
  }

  return from;
};

type MarkIndex = Readonly<{
  byBlock: ReadonlyMap<string, readonly InkMark[]>;
  marks: readonly InkMark[];
  reachAbove: number;
  reachBelow: number;
}>;

type Span = (
  screen: number,
  index: MarkIndex
) => readonly [viewportFrom: number, viewportTo: number];

const nearView: Span = (screen, { reachAbove, reachBelow }) => [
  -Math.max(screen, reachBelow),
  screen + Math.max(screen, reachAbove),
];

const everywhere: Span = () => [
  Number.NEGATIVE_INFINITY,
  Number.POSITIVE_INFINITY,
];

type NearBlock = Readonly<{
  box: InkBox;
  element: HTMLElement;
  id: string;
  key: NodeKey;
  text: string;
}>;

export const createInkPlacer = ({
  editable,
  layer,
  view,
}: Readonly<{ editable: HTMLElement; layer: HTMLElement; view: Editor }>) => {
  const { read } = view.plugin(InkPlugin);
  const layouts = createInkLayouts();
  const lowestOf = new WeakMap<Element, readonly HTMLElement[]>();
  const textBlocks = new WeakMap<
    object,
    WeakMap<object, Readonly<{ id: string; text: string }> | undefined>
  >();
  const held = new Map<string, Held>();
  let index: MarkIndex | null = null;
  let gone: readonly InkMark[] | null = null;

  const entryOf = (mark: InkMark) =>
    view.read((state) =>
      readInkIndexedMark({ copy: read.copy, editor: view, state }, mark)
    );
  const signOf = (mark: InkMark) =>
    view.read((state) =>
      readInkSign({ copy: read.copy, editor: view, state }, mark)
    );

  const textBlock = (key: NodeKey) => {
    const node = view.read.nodes.get(key)?.[0];

    if (!node) return undefined;

    const { schema } = view.read;
    let bySchema = textBlocks.get(schema.identity());

    if (!bySchema) {
      bySchema = new WeakMap();
      textBlocks.set(schema.identity(), bySchema);
    }
    if (!bySchema.has(node)) bySchema.set(node, inkTextBlockOf(schema, node));

    return bySchema.get(node);
  };

  const lowestBlocks = (element: HTMLElement) => {
    let lowest = lowestOf.get(element);

    if (!lowest) {
      const inner = element.querySelectorAll<HTMLElement>(LOWEST);

      lowest =
        inner.length === 0
          ? [element]
          : [...inner].filter((child) => !child.querySelector(LOWEST));
      lowestOf.set(element, lowest);
    }

    return lowest;
  };

  const indexed = (marks: readonly InkMark[]) => {
    if (index?.marks === marks) return index;

    const byBlock = new Map<string, InkMark[]>();
    const saved = new Set(marks.map((mark) => mark.id));
    let reachAbove = 0;
    let reachBelow = 0;

    for (const id of held.keys()) {
      if (!saved.has(id)) held.delete(id);
    }
    for (const mark of marks) {
      for (const block of mark.blocks) {
        const copy = read.copy(block.copy);

        if (!copy) continue;

        const list = byBlock.get(copy.block) ?? [];

        if (!list.includes(mark)) list.push(mark);
        byBlock.set(copy.block, list);
      }

      const [first] = mark.blocks;
      const radius = mark.brush.size / 2;

      for (const [, y] of first ? mark.samples : []) {
        reachAbove = Math.max(reachAbove, first.top - y + radius);
        reachBelow = Math.max(reachBelow, y + radius - first.top);
      }
    }
    index = { byBlock, marks, reachAbove, reachBelow };
    gone = null;

    return index;
  };

  const openPass = (span: Span, fresh: boolean) => {
    const marks = read.marks();

    if (marks.length === 0) return undefined;

    const rect = layer.getBoundingClientRect();
    const origin = { left: rect.left, top: rect.top };
    const stacks = stacksChildren(getComputedStyle(editable));
    const markIndex = indexed(marks);
    const [viewportLow, viewportHigh] = span(
      layer.ownerDocument.defaultView?.innerHeight ?? 0,
      markIndex
    );

    const blocksBetween = (viewportFrom: number, viewportTo: number) => {
      const top = editable.children;
      const between: NearBlock[] = [];

      for (
        let at = stacks ? firstEndingBelow(top, viewportFrom) : 0;
        at < top.length;
        at++
      ) {
        let allBelow = true;

        for (const element of lowestBlocks(top[at] as HTMLElement)) {
          const box = inkBoxOf(element, origin);

          if (box.top + origin.top > viewportTo) continue;
          allBelow = false;
          if (box.top + box.height + origin.top < viewportFrom) continue;

          const key = element.getAttribute(
            'data-editor-node-key'
          ) as NodeKey | null;
          const block =
            key && element.getAttribute('data-editor-node') === 'element'
              ? textBlock(key)
              : undefined;

          if (key && block) between.push({ box, element, key, ...block });
        }
        if (allBelow && stacks) break;
      }

      return between;
    };

    const blocks = blocksBetween(viewportLow, viewportHigh);
    const byKey = new Map<
      NodeKey,
      Pick<NearBlock, 'box' | 'element' | 'text'> | undefined
    >(blocks.map((block) => [block.key, block]));
    const measured = new Map<NodeKey, InkMeasuredBlock | undefined>();
    const blockAt = (key: NodeKey) => {
      if (!byKey.has(key)) {
        const element = view.api.dom.resolveDOMNode(key);
        const found = textBlock(key);

        byKey.set(
          key,
          element && found
            ? { box: inkBoxOf(element, origin), element, text: found.text }
            : undefined
        );
      }

      return byKey.get(key);
    };
    const measure = (key: NodeKey) => {
      if (!measured.has(key)) {
        const block = blockAt(key);

        measured.set(
          key,
          block &&
            layouts.measure(block.element, block.text, block.box, origin, fresh)
        );
      }

      return measured.get(key);
    };
    const candidatesBetween = (from: number, to: number) => {
      if (from + origin.top >= viewportLow && to + origin.top <= viewportHigh) {
        return blocks;
      }

      const band = blocksBetween(from + origin.top, to + origin.top);

      for (const block of band) {
        if (!byKey.has(block.key)) byKey.set(block.key, block);
      }

      return band;
    };

    const stillHeld = (
      mark: InkMark,
      entry: InkIndexedMark
    ): Decided | undefined => {
      const kept = held.get(mark.id);

      if (kept?.entry !== entry || kept.width !== rect.width) {
        return undefined;
      }

      const top = blockAt(kept.firstKey)?.box.top;

      if (top === undefined) return undefined;

      const band = {
        from: kept.bandFromFirst.from + top,
        to: kept.bandFromFirst.to + top,
      };
      const crossing = candidatesBetween(band.from, band.to).filter(({ box }) =>
        crosses(box, band)
      ).length;

      if (
        crossing !== kept.crossing ||
        !kept.witnesses.every(({ boxFromFirst, key, lines }) => {
          const now = blockAt(key);

          return (
            now !== undefined &&
            layouts.lines(now.element) === lines &&
            sameInkBox({ ...now.box, top: now.box.top - top }, boxFromFirst)
          );
        })
      ) {
        return undefined;
      }

      const { place, placement } = kept;

      return {
        place,
        placement:
          placement.type === 'ink'
            ? { ...placement, dy: placement.dy + top - kept.firstTop }
            : placement,
      };
    };

    const decide: Decide = (mark, entry) => {
      const kept = fresh ? undefined : stillHeld(mark, entry);

      if (kept) return kept;

      const { copies } = entry;
      const places = copies.map((copy) => read.place(copy.id));
      const { band, crossing, first, keys, live, near } = inkInputs(
        mark,
        copies,
        places,
        measure,
        candidatesBetween
      );
      const placement = placeMark({
        copies,
        live,
        margins: first
          ? {
              left: first.box.left,
              right: rect.width - first.box.left - first.box.width,
            }
          : { left: 0, right: 0 },
        mark,
        nearby: near.flatMap((block) => inkWordBoxes(block, band)),
      });
      const place = places.find((at) => at?.kind !== 'live') ?? places[0];
      const firstTop = first?.box.top ?? 0;
      const witnesses = keys.flatMap((key): Witness[] => {
        const block = blockAt(key);
        const lines = measure(key)?.lines;

        return block && lines
          ? [
              {
                boxFromFirst: { ...block.box, top: block.box.top - firstTop },
                key,
                lines,
              },
            ]
          : [];
      });
      const everyBlockMeasured =
        live[0] !== undefined && witnesses.length === keys.length;

      metrics.decided += 1;
      if (everyBlockMeasured) {
        held.set(mark.id, {
          bandFromFirst: { from: band.from - firstTop, to: band.to - firstTop },
          crossing,
          entry,
          firstKey: keys[0],
          firstTop,
          place,
          placement,
          width: rect.width,
          witnesses,
        });
      } else {
        held.delete(mark.id);
      }

      return { place, placement };
    };

    gone ??= marks.filter((mark) => signOf(mark)?.state === 'deleted');

    const shown = new Set(gone);

    for (const block of blocks) {
      for (const mark of markIndex.byBlock.get(block.id) ?? []) shown.add(mark);
    }

    return { decide, origin, shown: marks.filter((mark) => shown.has(mark)) };
  };

  const placeWithin = (span: Span): InkPlaced => {
    const pass = openPass(span, false);

    return pass
      ? placeInkMarks(
          view,
          editable,
          pass.origin,
          pass.shown,
          entryOf,
          signOf,
          pass.decide
        )
      : {
          bottom: editable.offsetTop + editable.offsetHeight,
          ink: [],
          signs: [],
        };
  };

  return {
    audit: (): InkAudit => {
      const pass = openPass(nearView, true);
      let at = 0;

      return (expired) => {
        if (!pass) return false;
        while (at < pass.shown.length) {
          const mark = pass.shown[at];
          const entry = entryOf(mark);

          at += 1;
          if (entry && !signOf(mark)) pass.decide(mark, entry);
          if (expired()) break;
        }

        return at < pass.shown.length;
      };
    },
    layoutChanged: (change: InkLayoutChange, within?: Element) => {
      layouts.changed(change, within);
      if (change !== 'words') return;
      for (let node = within; node?.parentElement; node = node.parentElement) {
        if (node.parentElement === editable) {
          lowestOf.delete(node);
          break;
        }
      }
    },
    nodesChanged: () => {
      gone = null;
    },
    place: () => placeWithin(nearView),
    placeEvery: () => placeWithin(everywhere),
  };
};
