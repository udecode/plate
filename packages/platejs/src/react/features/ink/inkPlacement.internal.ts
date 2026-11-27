import type { NodeKey } from '../../../facade';
import type { InkCopy, InkCopyPlace, InkMark } from '../../../features/ink/lib';
import { blockAbove } from '../../../features/ink/lib/inkGone.internal';
import {
  type InkBox,
  type InkPlacement,
  type InkText,
  placeMark,
} from '../../../features/ink/lib/inkMatch.internal';
import {
  byMark,
  type InkDeletedSign,
  type InkIndexedMark,
  type InkMarkSign,
  readInkDeletedSigns,
  readInkIndexedMark,
  readInkSign,
} from '../../../features/ink/lib/inkPlaces.internal';
import type { Editor } from '../../core';
import type { InkSign } from './InkContent';
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

type InkPin = Readonly<{ at: InkLayerOrigin; element: Element }>;

export type InkPlaced = Readonly<{
  bottom: number;
  contentOrigin: InkLayerOrigin;
  ink: ReadonlyArray<
    Readonly<{
      digitized?: boolean;
      dx: number;
      dy: number;
      mark: InkMark;
      pin?: InkPin;
    }>
  >;
  signs: ReadonlyArray<
    Readonly<{ id: string; left: number; sign: InkSign; top: number }>
  >;
}>;

export const NOTHING_PLACED: InkPlaced = {
  bottom: 0,
  contentOrigin: { left: 0, top: 0 },
  ink: [],
  signs: [],
};

export type InkArrival = Readonly<{
  placed: InkPlaced;
  undecided: 'band' | 'screen' | undefined;
}>;

type Places = ReadonlyArray<InkCopyPlace | undefined>;

type Witness = Readonly<{
  boxFromFirst: InkBox;
  key: NodeKey;
  lines: InkMeasuredBlock['lines'];
}>;

type Decided = Readonly<{
  pin: Element | undefined;
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

const metrics = {
  arrivalLookups: 0,
  decided: 0,
  indexRebuilds: 0,
  sampleVisits: 0,
  shownIds: 0,
  signReads: 0,
};

export const getInkPlacementMetrics = () => Object.freeze({ ...metrics });

const isClippedByInnerAncestor = (
  element: Element,
  editable: HTMLElement,
  origin: InkLayerOrigin,
  mark: InkMark,
  dx: number,
  dy: number
) => {
  if (!element.parentElement || element.parentElement === editable) {
    return false;
  }

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  const radius = mark.brush.size / 2;

  for (const [x, y] of mark.samples) {
    minX = Math.min(minX, x + dx - radius);
    maxX = Math.max(maxX, x + dx + radius);
    minY = Math.min(minY, y + dy - radius);
    maxY = Math.max(maxY, y + dy + radius);
  }

  for (
    let ancestor: HTMLElement | null = element.parentElement;
    ancestor && ancestor !== editable;
    ancestor = ancestor.parentElement
  ) {
    const { overflowX, overflowY } = getComputedStyle(ancestor);
    const clipsX = /auto|clip|hidden|scroll/.test(overflowX);
    const clipsY = /auto|clip|hidden|scroll/.test(overflowY);

    if (!clipsX && !clipsY) continue;

    const clip = inkBoxOf(ancestor, origin);

    if (
      (clipsX && (minX < clip.left - 1 || maxX > clip.left + clip.width + 1)) ||
      (clipsY && (minY < clip.top - 1 || maxY > clip.top + clip.height + 1))
    ) {
      return true;
    }
  }

  return false;
};

const crosses = (box: InkBox, { from, to }: InkBand) =>
  box.top <= to && box.top + box.height >= from;

const inkInputs = (
  mark: InkMark,
  copies: readonly InkCopy[],
  places: Places,
  measure: (key: NodeKey) => InkMeasuredBlock | undefined,
  candidatesBetween: (from: number, to: number) => readonly NearBlock[]
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

type DeletedEntry = InkDeletedSign & Readonly<{ digitized?: boolean }>;

const placeInkMarks = (
  view: Editor,
  editable: HTMLElement,
  origin: InkLayerOrigin,
  marks: readonly InkMark[],
  deleted: readonly DeletedEntry[],
  entryOf: (mark: InkMark) => InkIndexedMark | undefined,
  signOf: (mark: InkMark) => InkMarkSign | undefined,
  decide: (...of: Parameters<Decide>) => Decided | undefined,
  isDigitized: (mark: InkMark) => boolean
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
  const pins = new Map<Element, InkPin>();
  const pinAt = (element: Element) => {
    let pin = pins.get(element);

    if (!pin) {
      const { left, top } = inkBoxOf(element, origin);

      pin = { at: { left, top }, element };
      pins.set(element, pin);
    }

    return pin;
  };
  const anchors = new Map<NodeKey, InkBox | undefined>();
  const anchorBox = (key: NodeKey) => {
    if (!anchors.has(key)) {
      const element = view.api.dom.resolveDOMNode(key);

      anchors.set(key, element ? inkBoxOf(element, origin) : undefined);
    }

    return anchors.get(key);
  };
  const above = new Map<NodeKey, NodeKey | undefined>();
  const aboveOf = (key: NodeKey) => {
    if (!above.has(key)) {
      above.set(
        key,
        view.read((state) => {
          const [, path] = state.nodes.get(key) ?? [];
          const id = path && blockAbove(state.value(), path);

          return id === undefined ? undefined : state.nodes.byId(id)?.key;
        })
      );
    }

    return above.get(key);
  };
  const anchorOf = (place: InkCopyPlace | undefined) => {
    if (place?.kind === 'live' || place?.kind === 'changed') {
      return { id: place.key, top: anchorBox(place.key)?.top ?? startTop };
    }

    const beside = place?.kind === 'gone' ? place.beside : undefined;

    if (!beside || beside.at === 'start') return { id: 'start', top: startTop };

    const upper = beside.at === 'before' ? aboveOf(beside.key) : undefined;
    const { at, key } =
      upper === undefined ? beside : { at: 'after' as const, key: upper };
    const box = anchorBox(key);

    return {
      id: `${at}:${key}`,
      top: box ? box.top + (at === 'after' ? box.height : 0) : startTop,
    };
  };
  const ink: Array<InkPlaced['ink'][number]> = [];
  const signs = new Map<
    string,
    {
      digitized: boolean;
      first: InkMark;
      left: number;
      marks: string[];
      state: InkSign['state'];
      top: number;
    }
  >();

  for (const mark of marks) {
    const entry = entryOf(mark);

    if (!entry) continue;

    const digitized = isDigitized(mark);
    const kept = signOf(mark);
    let state: InkSign['state'] | undefined = kept?.state;
    let place = kept?.place;

    if (!kept) {
      const decided = decide(mark, entry);

      if (!decided) continue;

      const { pin, placement } = decided;

      if (placement.type === 'ink') {
        ink.push({
          ...(digitized && { digitized: true }),
          dx: placement.dx,
          dy: placement.dy,
          mark,
          ...(pin && { pin: pinAt(pin) }),
        });
      }
      state = placement.type === 'sign' ? placement.reason : placement.sign;
      ({ place } = decided);
    }
    if (!state) continue;

    const anchor = anchorOf(place);
    const id = `${mark.direction}|${anchor.id}|${state}${digitized ? '|digitized' : ''}`;
    const sign = signs.get(id) ?? {
      digitized,
      first: mark,
      left: rails[mark.direction],
      marks: [],
      state,
      top: anchor.top,
    };

    sign.marks.push(mark.id);
    signs.set(id, sign);
  }

  const gone = new Map<
    string,
    Readonly<{
      digitized: boolean;
      ids: readonly string[];
      marks: readonly InkMark[];
      top: number;
    }>
  >();

  for (const { digitized = false, ids, marks: of, place } of deleted) {
    const anchor = anchorOf(place);
    const id = `${of[0].direction}|${anchor.id}|deleted${digitized ? '|digitized' : ''}`;
    const there = gone.get(id);
    const merged = there && [...there.marks, ...of].sort(byMark);

    gone.set(id, {
      digitized,
      ids: merged ? merged.map((mark) => mark.id) : ids,
      marks: merged ?? of,
      top: anchor.top,
    });
  }

  return {
    bottom: editable.offsetTop + editable.offsetHeight,
    contentOrigin: {
      left: editableBox.left - editable.scrollLeft,
      top: editableBox.top - editable.scrollTop,
    },
    ink,
    signs: [
      ...[...signs].map(([id, { digitized, marks: ofSign, state, ...at }]) => ({
        ...at,
        id,
        sign: {
          ...(digitized && { digitized: true }),
          marks: ofSign,
          state,
        },
      })),
      ...[...gone].map(([id, { digitized, ids, marks: of, top }]) => ({
        first: of[0],
        id,
        left: rails[of[0].direction],
        sign: {
          ...(digitized && { digitized: true }),
          marks: ids,
          state: 'deleted' as const,
        },
        top,
      })),
    ]
      .sort((a, b) => byMark(a.first, b.first))
      .map(({ id, left, sign, top }) => ({ id, left, sign, top })),
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
  voids?: string;
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
    WeakMap<object, (InkText & Readonly<{ id: string }>) | undefined>
  >();
  const held = new Map<string, Held>();
  let index: MarkIndex | null = null;
  let heading = 1;
  let contentTop: number | undefined;

  const entryOf = (mark: InkMark) =>
    view.read((state) =>
      readInkIndexedMark({ copy: read.copy, editor: view, state }, mark)
    );
  const signOf = (mark: InkMark, includeDigitized = false) => {
    metrics.signReads += 1;

    return view.read((state) =>
      readInkSign(
        { copy: read.copy, editor: view, state },
        mark,
        includeDigitized
      )
    );
  };
  const deletedSigns = () =>
    view.read((state) =>
      readInkDeletedSigns({
        copy: read.copy,
        editor: view,
        marks: read.shownMarks,
        state,
      })
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

    metrics.indexRebuilds += 1;

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
        metrics.sampleVisits += 1;
        reachAbove = Math.max(reachAbove, first.top - y + radius);
        reachBelow = Math.max(reachBelow, y + radius - first.top);
      }
    }
    index = { byBlock, marks, reachAbove, reachBelow };

    return index;
  };

  const openPass = (span: Span, fresh: boolean) => {
    const showDigitized = view.plugin(InkPlugin).viewStore.get('showDigitized');
    const shownMarks = read.shownMarks();
    const marks = showDigitized ? read.marks() : shownMarks;

    if (marks.length === 0) return undefined;

    const shownIds =
      showDigitized && shownMarks !== marks
        ? new Set(shownMarks.map((mark) => mark.id))
        : null;
    const isDigitized = (mark: InkMark) =>
      shownIds !== null && !shownIds.has(mark.id);
    const readSign = (mark: InkMark) => signOf(mark, isDigitized(mark));

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
      Pick<NearBlock, 'box' | 'element' | 'text' | 'voids'> | undefined
    >(blocks.map((block) => [block.key, block]));
    const measured = new Map<NodeKey, InkMeasuredBlock | undefined>();
    const blockAt = (key: NodeKey) => {
      if (!byKey.has(key)) {
        const element = view.api.dom.resolveDOMNode(key);
        const found = textBlock(key);

        byKey.set(
          key,
          element && found
            ? {
                box: inkBoxOf(element, origin),
                element,
                text: found.text,
                voids: found.voids,
              }
            : undefined
        );
      }

      return byKey.get(key);
    };
    const measure = (key: NodeKey) => {
      if (!measured.has(key)) {
        const block = blockAt(key);
        const layout =
          block &&
          layouts.measure(block.element, block.text, block.box, origin, fresh);

        // A layout is kept per element, and a mention changed in place can
        // leave its element untouched, so the voids come from the node.
        measured.set(
          key,
          layout && block.voids !== undefined
            ? { ...layout, voids: block.voids }
            : layout
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
    const pinsOf = new Map<Element, Element | undefined>();
    const pinOf = (element: Element) => {
      if (!pinsOf.has(element)) {
        let pin: Element | null = element;

        while (
          pin &&
          pin !== editable &&
          !/sticky|fixed/.test(getComputedStyle(pin).position)
        ) {
          pin = pin.parentElement;
        }
        pinsOf.set(element, pin && pin !== editable ? pin : undefined);
      }

      return pinsOf.get(element);
    };
    const candidatesMovingWith = (pin: Element | undefined) =>
      pin
        ? (from: number, to: number) =>
            candidatesBetween(from, to).filter(
              ({ element }) => pinOf(element) === pin
            )
        : candidatesBetween;

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
      const crossing = candidatesMovingWith(kept.pin)(
        band.from,
        band.to
      ).filter(({ box }) => crosses(box, band)).length;

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

      const { pin, place, placement } = kept;

      return {
        pin,
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
      const [start] = places.flatMap((at) =>
        at && at.kind !== 'gone' ? [at.key] : []
      );
      const anchor = start === undefined ? undefined : blockAt(start)?.element;
      const pin = anchor && pinOf(anchor);
      const { band, crossing, first, keys, live, near } = inkInputs(
        mark,
        copies,
        places,
        measure,
        candidatesMovingWith(pin)
      );
      const rawPlacement = placeMark({
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
      const placement: InkPlacement =
        rawPlacement.type === 'ink' &&
        !mark.margin &&
        places.some((at) => {
          if (!at || at.kind === 'gone') return false;

          const element = blockAt(at.key)?.element;

          return (
            element !== undefined &&
            isClippedByInnerAncestor(
              element,
              editable,
              origin,
              mark,
              rawPlacement.dx,
              rawPlacement.dy
            )
          );
        })
          ? { reason: 'changed', type: 'sign' }
          : rawPlacement;
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
          pin,
          place,
          placement,
          width: rect.width,
          witnesses,
        });
      } else {
        held.delete(mark.id);
      }

      return { pin, place, placement };
    };

    const deleted: DeletedEntry[] = [...deletedSigns()];

    if (shownIds !== null) {
      for (const mark of marks) {
        if (!isDigitized(mark)) continue;

        const kept = readSign(mark);

        if (kept?.state === 'deleted') {
          deleted.push({
            digitized: true,
            ids: [mark.id],
            marks: [mark],
            place: kept.place,
          });
        }
      }
    }

    const visible = new Set(
      blocks.flatMap((block) => markIndex.byBlock.get(block.id) ?? [])
    );

    return {
      blocks,
      decide,
      deleted,
      isDigitized,
      marksOn: (block: string) => markIndex.byBlock.get(block) ?? [],
      origin,
      readSign,
      shown: [...visible]
        .filter((mark) => readSign(mark)?.state !== 'deleted')
        .sort(byMark),
      stillHeld,
    };
  };

  const placeWithin = (span: Span): InkPlaced => {
    const pass = openPass(span, false);

    return pass
      ? placeInkMarks(
          view,
          editable,
          pass.origin,
          pass.shown,
          pass.deleted,
          entryOf,
          pass.readSign,
          pass.decide,
          pass.isDigitized
        )
      : {
          ...NOTHING_PLACED,
          bottom: editable.offsetTop + editable.offsetHeight,
        };
  };

  return {
    arrive: (
      shown: InkPlaced,
      expired: (onScreen: boolean) => boolean
    ): InkArrival => {
      const pass = openPass(nearView, false);

      if (!pass) {
        return { placed: placeWithin(nearView), undecided: undefined };
      }

      const screen = layer.ownerDocument.defaultView?.innerHeight ?? 0;
      const ranks = new Map<InkMark, number>();

      for (const { box, id } of pass.blocks) {
        const top = box.top + pass.origin.top;
        const ahead = top >= screen === heading > 0 ? 1 : 2;
        const rank = top < screen && top + box.height > 0 ? 0 : ahead;

        for (const mark of pass.marksOn(id)) {
          ranks.set(mark, Math.min(rank, ranks.get(mark) ?? rank));
        }
      }

      const showing = new Set(pass.deleted.map(({ ids }) => ids));
      let before: ReadonlySet<string> | undefined;
      const shownBefore = (id: string) => {
        metrics.arrivalLookups += 1;
        if (!before) {
          before = new Set([
            ...shown.ink.map(({ mark }) => mark.id),
            ...shown.signs.flatMap(({ sign }) =>
              showing.has(sign.marks) ? [] : sign.marks
            ),
          ]);
          metrics.shownIds += before.size;
        }

        return before.has(id);
      };
      const decided = new Map<InkMark, Decided>();
      let undecided: InkArrival['undecided'];
      let arrivalsDecided = 0;

      for (const [mark, rank] of [...ranks].sort(([, a], [, b]) => a - b)) {
        const entry = entryOf(mark);

        if (!entry || pass.readSign(mark)) continue;

        const kept = pass.stillHeld(mark, entry);

        const arriving = !kept && !shownBefore(mark.id);

        if (arriving) {
          if (undecided || (arrivalsDecided > 0 && expired(rank === 0))) {
            undecided ??= rank === 0 ? 'screen' : 'band';
            continue;
          }
          arrivalsDecided += 1;
        }
        decided.set(mark, kept ?? pass.decide(mark, entry));
      }

      return {
        placed: placeInkMarks(
          view,
          editable,
          pass.origin,
          pass.shown,
          pass.deleted,
          entryOf,
          pass.readSign,
          (mark) => decided.get(mark),
          pass.isDigitized
        ),
        undecided,
      };
    },
    audit: (): InkAudit => {
      const pass = openPass(nearView, true);
      let at = 0;

      return (expired) => {
        if (!pass) return false;
        while (at < pass.shown.length) {
          const mark = pass.shown[at];
          const entry = entryOf(mark);

          at += 1;
          if (entry && !pass.readSign(mark)) pass.decide(mark, entry);
          if (expired()) break;
        }

        return at < pass.shown.length;
      };
    },
    follow: ({ contentOrigin, ink }: InkPlaced): InkPlaced['ink'] => {
      const rect = layer.getBoundingClientRect();
      const box = inkBoxOf(editable, rect);
      const top = box.top - editable.scrollTop;
      const moved = new Map<Element | undefined, InkLayerOrigin>([
        [
          undefined,
          {
            left: box.left - editable.scrollLeft - contentOrigin.left,
            top: top - contentOrigin.top,
          },
        ],
      ]);

      if (contentTop !== undefined && top + rect.top !== contentTop) {
        heading = top + rect.top < contentTop ? 1 : -1;
      }
      contentTop = top + rect.top;

      const next = ink.map((each) => {
        let by = moved.get(each.pin?.element);

        if (!by && each.pin) {
          const now = inkBoxOf(each.pin.element, rect);

          by = {
            left: now.left - each.pin.at.left,
            top: now.top - each.pin.at.top,
          };
          moved.set(each.pin.element, by);
        }

        return by && (by.left !== 0 || by.top !== 0)
          ? { ...each, dx: each.dx + by.left, dy: each.dy + by.top }
          : each;
      });

      return next.every((each, n) => each === ink[n]) ? ink : next;
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
    place: () => placeWithin(nearView),
    placeEvery: () => placeWithin(everywhere),
  };
};
