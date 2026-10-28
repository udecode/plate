import { BROWSER_HANDLE_KEY } from './constants';

const KiB = 1024;
export const readOptions = {
  budgets: {
    blocks: 16 * KiB,
    commit: 16 * KiB,
    frame: 1024 * KiB,
    inputState: 8 * KiB,
    selection: 4 * KiB,
    trace: 16 * KiB,
    value: 64 * KiB,
  },
  key: BROWSER_HANDLE_KEY,
  listItems: 100,
  nodeTextChars: 200,
  stringChars: 2000,
  traceEntries: 20,
  windowBlocks: 10,
};

// Playwright sends this function's source to the page, so it uses nothing
// from its closure.
export const readFrame = ({
  budgets,
  key,
  listItems,
  nodeTextChars,
  stringChars,
  traceEntries,
  windowBlocks,
}: typeof readOptions) => {
  type Unread = { state: 'unread'; reason: string; message?: string };
  type Field =
    | Unread
    | { state: 'read'; value: unknown }
    | { state: 'cut'; value: unknown; note: string };
  type Cut = (value: unknown) => { value: unknown; note: string };
  type Handle = Record<string, unknown>;

  const encoder = new TextEncoder();
  const bytesOf = (value: unknown) =>
    encoder.encode(JSON.stringify(value) ?? 'null').length;
  const clip = <T extends string | null>(text: T, chars: number) =>
    text !== null && text.length > chars
      ? `${text.slice(0, chars)}… (${text.length} characters)`
      : text;
  const unread = (reason: string, message?: string): Unread =>
    message === undefined
      ? { state: 'unread', reason }
      : { state: 'unread', reason, message: clip(message, 500) };

  const shortenNote = `strings over ${stringChars} characters and lists over ${listItems} items shortened`;
  const shorten = (value: unknown): unknown => {
    if (typeof value === 'string') {
      return value.length > stringChars
        ? `${value.slice(0, stringChars)}… (${value.length} characters)`
        : value;
    }
    if (Array.isArray(value)) {
      const kept = value.slice(0, listItems).map(shorten);

      return value.length > listItems
        ? [...kept, `… (${value.length} items)`]
        : kept;
    }
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([name, item]) => [name, shorten(item)])
      );
    }

    return value;
  };
  const shortened: Cut = (value) => ({
    note: shortenNote,
    value: shorten(value),
  });

  const fit = (value: unknown, budget: number, cut = shortened): Field => {
    const bytes = bytesOf(value);

    if (bytes <= budget) return { state: 'read', value };

    const smaller = cut(value);
    const smallerBytes = bytesOf(smaller.value);

    if (smallerBytes <= budget) return { state: 'cut', ...smaller };

    return unread(
      'over-budget',
      `${bytes} bytes, still ${smallerBytes} after cutting (${smaller.note}), past the ${budget} byte limit`
    );
  };
  const call = (
    handle: Handle | undefined,
    name: string
  ): Unread | { value: unknown } => {
    if (!handle) return unread('no-handle');

    const getter = handle[name];

    if (typeof getter !== 'function') return unread('no-getter');

    try {
      const raw: unknown = getter.call(handle);

      if (
        raw instanceof Node ||
        raw instanceof AbstractRange ||
        raw instanceof Selection
      ) {
        return unread('dom-object', `${name} returned a DOM object`);
      }

      return { value: JSON.parse(JSON.stringify(raw ?? null)) };
    } catch (error) {
      return unread('threw', String((error as Error)?.message ?? error));
    }
  };
  const read = (
    handle: Handle | undefined,
    name: string,
    budget: number,
    cut?: Cut
  ): Field => {
    const result = call(handle, name);

    return 'state' in result ? result : fit(result.value, budget, cut);
  };

  const roots: HTMLElement[] = [];
  const collect = (scope: Document | ShadowRoot) => {
    for (const element of scope.querySelectorAll<HTMLElement>('*')) {
      if (element.getAttribute('data-editor') === 'true') roots.push(element);
      if (element.shadowRoot) collect(element.shadowRoot);
    }
  };

  collect(document);

  const elementOf = (node: Node | null | undefined) =>
    node?.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : (node?.parentElement ?? null);
  const ownerOf = (node: Node | null) => {
    let current = node;

    while (current) {
      const owner = elementOf(current)?.closest<HTMLElement>(
        '[data-editor="true"]'
      );

      if (owner) return owner;

      current = (current.getRootNode() as Partial<ShadowRoot>).host ?? null;
    }

    return null;
  };
  const describe = (node: Node | null) => {
    const element = elementOf(node);

    if (!element) return null;

    const id = element.id ? `#${clip(element.id, 100)}` : '';
    const testId = clip(element.getAttribute('data-testid'), 100);

    return `${element.localName}${id}${
      testId ? `[data-testid="${testId}"]` : ''
    }`;
  };
  const childPath = (node: Node, root: Node) => {
    const path: number[] = [];

    for (
      let current = node;
      current !== root && current.parentNode;
      current = current.parentNode
    ) {
      path.unshift(
        Array.prototype.indexOf.call(current.parentNode.childNodes, current)
      );
    }

    return path;
  };
  const point = (node: Node | null, offset: number) => {
    if (!node) return null;

    const owner = ownerOf(node);

    return {
      editor: owner ? roots.indexOf(owner) : null,
      element: describe(node),
      modelPath: clip(
        elementOf(node)
          ?.closest('[data-editor-path]')
          ?.getAttribute('data-editor-path') ?? null,
        200
      ),
      nodePath: owner?.contains(node) ? childPath(node, owner) : null,
      nodeType: node.nodeType,
      offset,
      text:
        node.nodeType === Node.TEXT_NODE
          ? clip(node.textContent ?? '', nodeTextChars)
          : null,
    };
  };
  const isLongText = (node: Node | null) =>
    node?.nodeType === Node.TEXT_NODE &&
    (node.textContent ?? '').length > nodeTextChars;
  const handleSelectionIn = (scope: Document | ShadowRoot) => {
    const own = (
      scope as { getSelection?: () => Selection | null }
    ).getSelection?.call(scope);

    return own
      ? {
          selection: own,
          source: scope === document ? 'document' : 'shadow root',
        }
      : { selection: document.getSelection(), source: 'document' };
  };
  const topBlockOf = (node: Node | null, root: HTMLElement) => {
    const block = elementOf(node)?.closest('[data-editor-path]');
    const path =
      block && ownerOf(block) === root
        ? block.getAttribute('data-editor-path')
        : null;
    const index = path ? Number.parseInt(path, 10) : Number.NaN;

    return Number.isFinite(index) ? index : undefined;
  };

  let active = document.activeElement;

  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }

  const activeOwner = ownerOf(active);

  const editors = roots.map((root, index) => {
    const handle = (root as unknown as Record<string, Handle | undefined>)[key];
    const { selection: native, source } = handleSelectionIn(
      root.getRootNode() as Document | ShadowRoot
    );
    const hasRange = !!native && native.rangeCount > 0;
    const anchorOwner = hasRange ? ownerOf(native.anchorNode) : null;
    const focusOwner = hasRange ? ownerOf(native.focusNode) : null;
    const ends = fit(
      hasRange
        ? {
            anchor: point(native.anchorNode, native.anchorOffset),
            collapsed: native.isCollapsed,
            focus: point(native.focusNode, native.focusOffset),
            source,
          }
        : null,
      budgets.selection
    );
    const nativeSelection: Field =
      ends.state === 'read' &&
      hasRange &&
      (isLongText(native.anchorNode) || isLongText(native.focusNode))
        ? {
            state: 'cut',
            value: ends.value,
            note: `text over ${nodeTextChars} characters shortened`,
          }
        : ends;
    const modelRaw = call(handle, 'getModelSelection');
    const modelSelection =
      'state' in modelRaw ? modelRaw : fit(modelRaw.value, budgets.selection);
    const model =
      'state' in modelRaw
        ? null
        : (modelRaw.value as {
            anchor?: { path?: number[] };
            anchorPath?: number[];
            focus?: { path?: number[] };
            focusPath?: number[];
          } | null);
    const centers = [
      model?.anchor?.path?.[0] ?? model?.anchorPath?.[0],
      model?.focus?.path?.[0] ?? model?.focusPath?.[0],
      anchorOwner === root
        ? topBlockOf(native?.anchorNode ?? null, root)
        : undefined,
      focusOwner === root
        ? topBlockOf(native?.focusNode ?? null, root)
        : undefined,
    ]
      .filter((block): block is number => Number.isInteger(block))
      .sort((a, b) => a - b);
    const keptRanges = (count: number) => {
      const ranges: Array<[number, number]> = [];

      for (const center of centers) {
        const from = Math.max(0, center - windowBlocks);
        const to = Math.min(count - 1, center + windowBlocks);
        const last = ranges.at(-1);

        if (from > to) continue;
        if (last && from <= last[1] + 1) {
          last[1] = Math.max(last[1], to);
        } else {
          ranges.push([from, to]);
        }
      }

      if (ranges.length > 0) return { around: true, ranges };

      return {
        around: false,
        ranges:
          count > 0
            ? [
                [0, Math.min(count, 2 * windowBlocks + 1) - 1] as [
                  number,
                  number,
                ],
              ]
            : [],
      };
    };
    const windowed = (
      count: number,
      budget: number,
      pick: (keep: (index: number) => boolean) => unknown[]
    ) => {
      const { around, ranges } = keptRanges(count);
      const kept = {
        blockCount: count,
        kept: ranges,
        blocks: pick((block) =>
          ranges.some(([from, to]) => block >= from && block <= to)
        ),
      };
      const note = `kept blocks ${
        ranges.map(([from, to]) => `${from} to ${to}`).join(', ') || 'none'
      } of ${count}, ${
        around
          ? 'around the selection ends'
          : 'from the start, with no selection'
      }`;

      return bytesOf(kept) <= budget
        ? { note, value: kept }
        : { note: `${note}; ${shortenNote}`, value: shorten(kept) };
    };

    const selection = read(handle, 'getSelection', budgets.selection);
    const valueRaw = call(handle, 'getValue');
    const whole = 'state' in valueRaw ? null : valueRaw.value;
    const record =
      whole && typeof whole === 'object' && !Array.isArray(whole)
        ? (whole as { children?: unknown; roots?: Record<string, unknown> })
        : null;
    const rootName = root.getAttribute('data-editor-root') ?? '';
    const named = record?.roots?.[rootName];
    const shown = Array.isArray(whole)
      ? whole
      : Array.isArray(named)
        ? named
        : record?.children;
    const value =
      'state' in valueRaw
        ? valueRaw
        : fit(whole, budgets.value, () => {
            if (!Array.isArray(shown)) return shortened(whole);

            const cut = windowed(shown.length, budgets.value, (keep) =>
              shown.filter((_, block) => keep(block))
            );

            if (!record) return cut;

            const shownName =
              shown === named ? `roots.${rootName}` : 'children';
            const rest =
              shown === named
                ? {
                    ...record,
                    roots: Object.fromEntries(
                      Object.entries(record.roots ?? {}).filter(
                        ([name]) => name !== rootName
                      )
                    ),
                  }
                : Object.fromEntries(
                    Object.entries(record).filter(
                      ([name]) => name !== 'children'
                    )
                  );

            const withRest = {
              note: `${shownName}: ${cut.note}; in the other keys, ${shortenNote}`,
              value: { ...(shorten(rest) as object), [shownName]: cut.value },
            };

            if (bytesOf(withRest.value) <= budgets.value) return withRest;

            return {
              note: `${shownName}: ${cut.note}; the other keys reduced to their sizes`,
              value: {
                ...Object.fromEntries(
                  Object.entries(rest).map(([name, item]) => [
                    name,
                    Array.isArray(item)
                      ? `… (${item.length} items)`
                      : item && typeof item === 'object'
                        ? `… (${Object.keys(item).length} keys)`
                        : shorten(item),
                  ])
                ),
                [shownName]: cut.value,
              },
            };
          });
    const blocks = Array.from(
      root.querySelectorAll('[data-editor-node="element"][data-editor-path]')
    )
      .filter(
        (block) =>
          !block.getAttribute('data-editor-path')?.includes(',') &&
          ownerOf(block) === root
      )
      .map((block) => {
        const copy = block.cloneNode(true) as Element;

        for (const string of copy.querySelectorAll(
          '[data-editor-string][data-editor-length]'
        )) {
          const length = Number.parseInt(
            string.getAttribute('data-editor-length') ?? '',
            10
          );

          if (Number.isFinite(length)) {
            string.textContent = (string.textContent ?? '').slice(0, length);
          }
        }

        return {
          index: Number.parseInt(
            block.getAttribute('data-editor-path') ?? '',
            10
          ),
          text: (copy.textContent ?? '').replaceAll('﻿', ''),
        };
      });
    const renderedBlocks =
      blocks.length === 0 && Array.isArray(shown) && shown.length > 0
        ? unread(
            'not-found',
            `no rendered top-level block found for a value of ${shown.length} blocks`
          )
        : fit(blocks, budgets.blocks, () =>
            windowed(
              blocks.reduce(
                (count, block) => Math.max(count, block.index + 1),
                0
              ),
              budgets.blocks,
              (keep) => blocks.filter((block) => keep(block.index))
            )
          );
    const lastCommit = read(
      handle,
      'getLastCommit',
      budgets.commit,
      (commit) => {
        const { change: _, ...rest } = (commit ?? {}) as Record<
          string,
          unknown
        >;

        return {
          note: `the change itself is left out; ${shortenNote}`,
          value: shorten(rest),
        };
      }
    );
    const traceRaw = call(handle, 'getKernelTrace');
    const kernelTrace = (() => {
      if ('state' in traceRaw) return traceRaw;
      if (!Array.isArray(traceRaw.value)) {
        return fit(traceRaw.value, budgets.trace);
      }

      const all = traceRaw.value;
      const last = all.slice(-traceEntries);
      const field = fit(last, budgets.trace, (list) => {
        const kept = shorten(list) as unknown[];

        while (kept.length > 0 && bytesOf(kept) > budgets.trace) kept.shift();

        return {
          note: `the last ${kept.length} of ${all.length} entries; ${shortenNote}`,
          value: kept,
        };
      });

      return field.state === 'read' && all.length > last.length
        ? {
            state: 'cut' as const,
            value: last,
            note: `the last ${last.length} of ${all.length} entries`,
          }
        : field;
    })();
    const inputState = read(handle, 'getInputState', budgets.inputState);
    const domSelection = ((): Field => {
      if (hasRange && anchorOwner === root && focusOwner === root) {
        const mapped = read(handle, 'getDOMSelection', budgets.selection);

        return mapped.state === 'read' && mapped.value === null
          ? unread(
              'unmapped',
              'the editor returned no range for a browser selection inside it'
            )
          : mapped;
      }
      if (
        hasRange &&
        (anchorOwner === root ||
          focusOwner === root ||
          root.contains(native.anchorNode) ||
          root.contains(native.focusNode))
      ) {
        return unread(
          'other-editor',
          'an end of the browser selection is outside this editor or in an editor nested in it'
        );
      }
      if (source === 'document' && root.getRootNode() !== document) {
        return unread(
          'shadow-root',
          'the browser selection was read from the document, which shows no position inside this shadow root'
        );
      }

      return hasRange
        ? unread('outside', 'the browser selection has no end in this editor')
        : unread('no-selection', 'the browser holds no selection here');
    })();

    return {
      ariaLabel: clip(root.getAttribute('aria-label'), 200),
      element: describe(root),
      focus:
        activeOwner === root
          ? active === root
            ? 'root'
            : 'inside'
          : 'outside',
      index,
      inShadowRoot: root.getRootNode() !== document,
      nativeSelection,
      modelSelection,
      selection,
      domSelection,
      inputState,
      renderedBlocks,
      value,
      lastCommit,
      kernelTrace,
    };
  });

  let frameBytes = bytesOf(editors);
  const byFocus = [...editors].sort(
    (a, b) => Number(a.focus !== 'outside') - Number(b.focus !== 'outside')
  );

  for (const name of [
    'value',
    'lastCommit',
    'kernelTrace',
    'renderedBlocks',
    'inputState',
    'selection',
    'domSelection',
    'nativeSelection',
    'modelSelection',
  ] as const) {
    for (const editor of byFocus) {
      if (frameBytes <= budgets.frame) break;

      const dropped = unread(
        'over-budget',
        `left out to keep the frame under ${budgets.frame} bytes`
      );

      frameBytes += bytesOf(dropped) - bytesOf(editor[name]);
      editor[name] = dropped;
    }
  }

  // Playwright's own serializer takes seconds on a large frame, which blocks
  // the write after it; a JSON string crosses in a fraction of that.
  return JSON.stringify({
    activeElement: describe(active),
    hasFocus: document.hasFocus(),
    editors,
  });
};

export type FrameRead = {
  activeElement: string | null;
  editors: Array<Record<string, unknown>>;
  hasFocus: boolean;
};
