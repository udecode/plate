import type { NodeKey } from '../../../facade';
import type { InkCopy, InkCopyPlace, InkMark } from '../../../features/ink/lib';
import {
  type InkBox,
  type InkPlacement,
  placeMark,
} from '../../../features/ink/lib/inkMatch.internal';
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

type Decide = (
  mark: InkMark,
  copies: readonly InkCopy[],
  places: Places
) => InkPlacement;

const DELETED = { reason: 'deleted', type: 'sign' } as const;

const WORDS_CHANGED = { reason: 'changed', type: 'sign' } as const;

type InkInputs = Readonly<{
  band: InkBand;
  first: InkMeasuredBlock | undefined;
  live: ReadonlyArray<InkMeasuredBlock | undefined>;
  near: readonly InkMeasuredBlock[];
}>;

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
  const from = Math.min(...ys) - reach;
  const to = Math.max(...ys) + reach;
  const marked = new Set(
    places.flatMap((place) =>
      place && place.kind !== 'gone' ? [place.key] : []
    )
  );
  const near = candidatesBetween(from, to).flatMap(({ box, key }) => {
    if (marked.has(key) || box.top > to || box.top + box.height < from) {
      return [];
    }

    return measure(key) ?? [];
  });

  return { band: { from, to }, first, live, near };
};

const placeInkMarks = (
  view: Editor,
  editable: HTMLElement,
  origin: InkLayerOrigin,
  marks: readonly InkMark[],
  decide: Decide
): InkPlaced => {
  const { read } = view.plugin(InkPlugin);
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
    const copies = mark.blocks.flatMap((block) => read.copy(block.copy) ?? []);

    if (copies.length !== mark.blocks.length) continue;

    const places = copies.map((copy) => read.place(copy.id));
    const placement = places.some((place) => place?.kind === 'gone')
      ? DELETED
      : decide(mark, copies, places);

    if (placement.type === 'ink') {
      ink.push({ dx: placement.dx, dy: placement.dy, mark });
    }

    const state = placement.type === 'sign' ? placement.reason : placement.sign;

    if (!state) continue;

    const anchor = anchorOf(
      places[
        Math.max(
          0,
          places.findIndex((place) => place?.kind !== 'live')
        )
      ]
    );
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

type Held = Readonly<{ key: string; placement: InkPlacement; top: number }>;

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
  const held = new WeakMap<InkMark, Held>();
  const ids = new WeakMap<object, number>();
  let nextId = 0;
  let index: MarkIndex | null = null;
  let gone: readonly InkMark[] | null = null;

  const idOf = (value: object) => {
    let id = ids.get(value);

    if (id === undefined) {
      id = nextId;
      nextId += 1;
      ids.set(value, id);
    }

    return id;
  };

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
    let reachAbove = 0;
    let reachBelow = 0;

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

  const placeWithin = (span: Span): InkPlaced => {
    const marks = read.marks();

    if (marks.length === 0) {
      return {
        bottom: editable.offsetTop + editable.offsetHeight,
        ink: [],
        signs: [],
      };
    }

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
    const byKey = new Map(blocks.map((block) => [block.key, block]));
    const measured = new Map<NodeKey, InkMeasuredBlock | undefined>();
    const resolve = (key: NodeKey) => {
      const element = view.api.dom.resolveDOMNode(key);
      const found = textBlock(key);

      return element && found
        ? { box: inkBoxOf(element, origin), element, text: found.text }
        : undefined;
    };
    const measure = (key: NodeKey) => {
      if (!measured.has(key)) {
        const block = byKey.get(key) ?? resolve(key);

        measured.set(
          key,
          block && layouts.measure(block.element, block.text, block.box, origin)
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

    const decide: Decide = (mark, copies, places) => {
      if (!mark.margin && places.some((place) => place?.kind === 'changed')) {
        return WORDS_CHANGED;
      }

      const inputs = inkInputs(
        mark,
        copies,
        places,
        measure,
        candidatesBetween
      );
      const top = inputs.first?.box.top ?? 0;
      const part = (block: InkMeasuredBlock | undefined) =>
        block
          ? [idOf(block.lines), block.box.left, block.box.top - top].join(':')
          : '-';
      const key = [
        rect.width,
        inputs.live.map(part).join(','),
        inputs.near.map(part).join(','),
      ].join('|');
      const kept = held.get(mark);

      if (kept?.key === key) {
        const { placement } = kept;

        if (placement.type !== 'ink') return placement;

        return { ...placement, dy: placement.dy + top - kept.top };
      }

      const { band, first, live, near } = inputs;
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

      held.set(mark, { key, placement, top });

      return placement;
    };

    gone ??= marks.filter((mark) =>
      mark.blocks.some((block) => {
        const copy = read.copy(block.copy);

        return copy && read.place(copy.id)?.kind === 'gone';
      })
    );

    const shown = new Set(gone);

    for (const block of blocks) {
      for (const mark of markIndex.byBlock.get(block.id) ?? []) shown.add(mark);
    }

    return placeInkMarks(
      view,
      editable,
      origin,
      marks.filter((mark) => shown.has(mark)),
      decide
    );
  };

  return {
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
