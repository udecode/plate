import type { InkBox } from '../../../features/ink/lib/inkMatch.internal';
import {
  INK_MOVE_TOLERANCE,
  inkBoxOf,
  sameInkBox,
} from './inkMeasure.internal';

/**
 * What may have changed for the words in the layer.
 *
 * - `boxes`: blocks may sit elsewhere in the layer or have another size. A line
 *   layout measured for a block whose size is the same still holds.
 * - `scroll`: a scroll moved blocks, as `boxes` does.
 * - `words`: words may sit elsewhere inside blocks whose boxes are all the
 *   same. No measured layout holds, or, when the report names an element, no
 *   layout of a block that holds it.
 * - `styles`: the named element's class, `dir`, `lang` or `style` changed. No
 *   layout holds of a block that holds it or that it holds.
 */
export type InkLayoutChange = 'boxes' | 'scroll' | 'styles' | 'words';

/** Whether every line layout measured before the change still holds. */
export const keepsLayouts = (change: InkLayoutChange) =>
  change === 'boxes' || change === 'scroll';

const INK_LAYOUT_ATTRIBUTES = ['class', 'dir', 'lang', 'style'];

type Place = Readonly<{ box: InkBox; height: number; width: number }>;

/** Whole pixels, each rounded away from the Editable, so the fitted box holds it. */
type Margins = readonly [
  top: number,
  right: number,
  bottom: number,
  left: number,
];

/**
 * How far the box the browser tests against sits inside the root's border box.
 * Learned from a first entry's `rootBounds`, never from styles.
 */
type RootEdge = Readonly<{
  bottom: number;
  left: number;
  right: number;
  top: number;
}>;

const NO_EDGE: RootEdge = { bottom: 0, left: 0, right: 0, top: 0 };

const near = (a: number, b: number) => Math.abs(a - b) <= INK_MOVE_TOLERANCE;

const placeOf = (editable: Element, layer: Element): Place => {
  const { height, left, top, width } = layer.getBoundingClientRect();

  return { box: inkBoxOf(editable, { left, top }), height, width };
};

const samePlace = (a: Place, b: Place) =>
  sameInkBox(a.box, b.box) &&
  near(a.width, b.width) &&
  near(a.height, b.height);

const fittedMargins = (
  target: DOMRectReadOnly,
  root: DOMRectReadOnly,
  edge: RootEdge
): Margins => [
  -Math.floor(target.top - root.top - edge.top) || 0,
  -Math.floor(root.right - edge.right - target.right) || 0,
  -Math.floor(root.bottom - edge.bottom - target.bottom) || 0,
  -Math.floor(target.left - root.left - edge.left) || 0,
];

const edgeOf = (
  entry: IntersectionObserverEntry,
  [top, right, bottom, left]: Margins,
  root: DOMRectReadOnly,
  fallback: RootEdge
): RootEdge => {
  const bounds = entry.rootBounds;

  if (!bounds) return fallback;

  return {
    bottom: root.bottom - (bounds.bottom - bottom),
    left: bounds.left + left - root.left,
    right: root.right - (bounds.right - right),
    top: bounds.top + top - root.top,
  };
};

const holds = ({
  boundingClientRect: box,
  rootBounds,
}: IntersectionObserverEntry) =>
  !!rootBounds &&
  rootBounds.top <= box.top + INK_MOVE_TOLERANCE &&
  rootBounds.left <= box.left + INK_MOVE_TOLERANCE &&
  rootBounds.right >= box.right - INK_MOVE_TOLERANCE &&
  rootBounds.bottom >= box.bottom - INK_MOVE_TOLERANCE;

type Size = readonly [inline: number, block: number];

const sizeCheck = (
  box: 'border-box' | 'content-box',
  delivered: (changed: boolean, first: Size | undefined) => void
) => {
  const reported = new Map<Element, Size>();

  return new ResizeObserver((entries) => {
    let changed = false;
    let first: Size | undefined;

    for (const entry of entries) {
      const [size] =
        box === 'border-box' ? entry.borderBoxSize : entry.contentBoxSize;
      const next = [size.inlineSize, size.blockSize] as const;
      const last = reported.get(entry.target);

      if (!last) {
        first = next;
        reported.set(entry.target, next);
      } else if (!near(last[0], next[0]) || !near(last[1], next[1])) {
        changed = true;
        reported.set(entry.target, next);
      }
    }
    delivered(changed, first);
  });
};

const isStyleSheet = (target: EventTarget | null) =>
  target instanceof HTMLLinkElement && target.relList.contains('stylesheet');

/**
 * Calls `report` when something may have moved the Editable's words in the
 * layer: a move or resize of the Editable, the layer or the layer's offset
 * parent, a scroll, a load or a failed load, a class, `dir`, `lang` or `style`
 * change on the Editable, an ancestor or an element inside it, a change to the
 * text or children inside it, a style sheet link that loads, or a web font. A
 * report from inside the Editable names the element it came from, the parent
 * for a text change, and is `styles` for an attribute change and `words`
 * otherwise. Changes the browser delivers together report once per element, as
 * `styles` when any of them is an attribute change. Moves under
 * {@link INK_MOVE_TOLERANCE} add up until they report. Unseen: a style sheet
 * edit that resizes nothing, and the move check of an Editable in a shadow root
 * whose layer's offset parent sits outside it. Also unseen when every box stays
 * the same: a neighbor's class, a CSS state selector, and a class inside the
 * Editable that restyles another block through a sibling or `:has()` selector.
 */
export const observeInkLayout = (
  editable: HTMLElement,
  layer: HTMLElement,
  report: (change: InkLayoutChange, within?: Element) => void
): (() => void) => {
  const document = editable.ownerDocument;
  let stopped = false;
  let place = placeOf(editable, layer);
  let edge = NO_EDGE;
  let root: Element | null = null;
  let fittedRoot: Size = [0, 0];
  let check: IntersectionObserver | null = null;
  let comparing = 0;
  let wantedRoot: Element | null = null;
  let rootFrame = 0;
  let looks = 0;

  const emit = (change: InkLayoutChange, within?: Element) => {
    if (!stopped) report(change, within);
  };

  const look = (sure: boolean, change: InkLayoutChange = 'boxes') => {
    if (stopped) return false;
    looks += 1;

    const next = placeOf(editable, layer);

    if (!sure && samePlace(place, next)) return false;
    place = next;
    fit();
    emit(change);

    return true;
  };

  const compareEachFrame = () => {
    check?.disconnect();
    check = null;

    const tick = () => {
      comparing = 0;
      if (!look(false)) comparing = requestAnimationFrame(tick);
    };

    comparing = requestAnimationFrame(tick);
  };

  const rootSize = sizeCheck('border-box', (changed, first) => {
    if (
      !changed &&
      !(
        first &&
        (!near(first[0], fittedRoot[0]) || !near(first[1], fittedRoot[1]))
      )
    ) {
      return;
    }
    edge = NO_EDGE;
    if (!look(false)) fit();
  });

  // Observing in a ResizeObserver delivery raises the loop error, so the root
  // changes on the next frame.
  const watchRoot = (next: Element | null) => {
    if (next === wantedRoot) return;
    wantedRoot = next;
    cancelAnimationFrame(rootFrame);
    rootFrame = requestAnimationFrame(() => {
      rootFrame = 0;
      if (stopped) return;
      rootSize.disconnect();
      if (wantedRoot) rootSize.observe(wantedRoot, { box: 'border-box' });
    });
  };

  // An IntersectionObserver whose root box, drawn in by margins, fits the
  // Editable, so it reports when the Editable leaves that box.
  const fit = () => {
    check?.disconnect();
    check = null;
    cancelAnimationFrame(comparing);
    comparing = 0;
    if (stopped) return;
    root = layer.offsetParent;
    watchRoot(root);
    if (!root?.contains(editable)) return;

    const box = editable.getBoundingClientRect();

    if (!box.width || !box.height) return;

    const watched = root;
    const rootBox = watched.getBoundingClientRect();
    const margins = fittedMargins(box, rootBox, edge);
    const looksAtFit = looks;
    let first = true;

    fittedRoot = [rootBox.width, rootBox.height];

    const mine = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);

        if (check !== mine || !entry) return;
        if (!first) {
          if (!look(false)) fit();

          return;
        }
        first = false;
        edge = edgeOf(entry, margins, watched.getBoundingClientRect(), edge);
        // A look since this fit, such as a scroll's, already compared the
        // place this entry would.
        if (looks === looksAtFit && look(false)) return;
        if (!holds(entry)) fit();
        else if (entry.intersectionRatio < 1) compareEachFrame();
      },
      {
        root: watched,
        rootMargin: margins.map((px) => `${px}px`).join(' '),
        threshold: 1,
      }
    );

    check = mine;
    mine.observe(editable);
  };

  const sized = (changed: boolean) => {
    look(changed);
  };
  const contentSize = sizeCheck('content-box', sized);
  const borderSize = sizeCheck('border-box', sized);
  const layerSize = sizeCheck('border-box', sized);

  const onScroll = ({ target }: Event) => {
    if (target === editable) emit('scroll');
    else if (target instanceof Element && editable.contains(target)) {
      emit('words', target);
    } else if (target instanceof Node && root?.contains(target)) {
      look(false, 'scroll');
    }
  };
  const onLoad = ({ target, type }: Event) => {
    if (target instanceof Element && editable.contains(target)) {
      emit('words', target);
    } else if (type === 'load' && isStyleSheet(target)) emit('words');
    else if (target instanceof Node && root?.contains(target)) look(false);
  };

  const restyle = new MutationObserver(() => {
    place = placeOf(editable, layer);
    fit();
    emit('words');
  });
  const mutated = new MutationObserver((records) => {
    const named = new Map<Element, InkLayoutChange>();

    for (const { target, type } of records) {
      const element = target instanceof Element ? target : target.parentElement;

      if (!element) continue;
      if (type !== 'attributes') {
        if (!named.has(element)) named.set(element, 'words');
      } else if (element !== editable) {
        // `restyle` reports the Editable's own attributes.
        named.set(element, 'styles');
      }
    }
    for (const [element, change] of named) emit(change, element);
  });

  // happy-dom has no FontFaceSet. WebKit fires no `loadingdone`, so a font
  // reports once the set is ready again after `loading`.
  const fonts = document.fonts as FontFaceSet | undefined;
  const onLoading = () => {
    void fonts?.ready.then(() => emit('words'));
  };

  const scope = editable.getRootNode();
  const targets: EventTarget[] =
    scope instanceof ShadowRoot ? [document, scope] : [document];

  fit();
  contentSize.observe(editable, { box: 'content-box' });
  borderSize.observe(editable, { box: 'border-box' });
  layerSize.observe(layer, { box: 'border-box' });
  for (const target of targets) {
    target.addEventListener('scroll', onScroll, {
      capture: true,
      passive: true,
    });
    target.addEventListener('load', onLoad, true);
    target.addEventListener('error', onLoad, true);
  }
  for (let node: Element | null = editable; node;) {
    restyle.observe(node, { attributeFilter: INK_LAYOUT_ATTRIBUTES });

    const parent: Node | null = node.parentNode;

    node = parent instanceof ShadowRoot ? parent.host : node.parentElement;
  }
  mutated.observe(editable, {
    attributeFilter: INK_LAYOUT_ATTRIBUTES,
    characterData: true,
    childList: true,
    subtree: true,
  });
  if (fonts) {
    fonts.addEventListener('loading', onLoading);
    if (fonts.status === 'loading') onLoading();
  }

  return () => {
    stopped = true;
    check?.disconnect();
    check = null;
    cancelAnimationFrame(comparing);
    cancelAnimationFrame(rootFrame);
    contentSize.disconnect();
    borderSize.disconnect();
    layerSize.disconnect();
    rootSize.disconnect();
    restyle.disconnect();
    mutated.disconnect();
    for (const target of targets) {
      target.removeEventListener('scroll', onScroll, { capture: true });
      target.removeEventListener('load', onLoad, true);
      target.removeEventListener('error', onLoad, true);
    }
    fonts?.removeEventListener('loading', onLoading);
  };
};

/** `signs` lists the tops of the layer's sign elements, in their DOM order. */
export const stackInkSigns = (
  layer: HTMLElement,
  signs: ReadonlyArray<Readonly<{ left: number; top: number }>>
): (() => void) => {
  const elements = layer.querySelectorAll<HTMLElement>(
    ':scope > [data-ink-sign]'
  );
  const byTop = signs
    .map(({ left, top }, index) => ({ element: elements[index], left, top }))
    .sort((a, b) => a.top - b.top);
  const stack = () => {
    const bottoms = new Map<number, number>();

    for (const { element, left, top } of byTop) {
      const at = Math.max(top, bottoms.get(left) ?? top);

      element.style.top = `${at}px`;
      bottoms.set(left, at + element.getBoundingClientRect().height);
    }
  };

  stack();

  if (elements.length < 2) return () => {};

  let frame = 0;
  // A restack inside the delivery can add a scrollbar that resizes the
  // Editable, which raises the ResizeObserver loop error.
  const resize = new ResizeObserver(() => {
    frame ||= requestAnimationFrame(() => {
      frame = 0;
      stack();
    });
  });

  for (const element of elements) {
    resize.observe(element, { box: 'border-box' });
  }

  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
  };
};
