import { describe, expect, it } from 'bun:test';

import {
  createEditor,
  definePlugin,
  defineStateField,
  type ElementOf,
} from 'plitejs';

import * as PlitePagination from '../../src/pagination';
import {
  createEstimatedPageLayoutEngine,
  measurePages,
  pageSettingsCodec,
  type NodeFragmentationProvider,
  type PageLayoutEngine,
  type PageLayoutFragment,
  type PageSettings,
} from '../../src/pagination';
import * as PlitePaginationReact from '../../src/pagination/react';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph' as const,
});

const defaultPage = { margins: 72, preset: 'letter' } as const;

const textRanges = (fragments: readonly PageLayoutFragment[]) =>
  fragments.flatMap((fragment) =>
    fragment.type === 'text'
      ? fragment.lines.flatMap((line) =>
          line.runs.map((run) => ({
            end: run.source.focus.offset,
            path: run.source.anchor.path,
            start: run.source.anchor.offset,
          }))
        )
      : []
  );

describe('pagination public surface', () => {
  it('exports only the surviving headless and React runtime values', () => {
    expect(Object.keys(PlitePagination).sort()).toEqual(
      [
        'createEstimatedPageLayoutEngine',
        'createPretextPageLayoutEngine',
        'measurePages',
        'pageSettingsCodec',
      ].sort()
    );
    expect(Object.keys(PlitePaginationReact).sort()).toEqual(
      [
        ...Object.keys(PlitePagination),
        'PagedEditable',
        'usePageLayout',
        'usePageLayoutFragments',
      ].sort()
    );
  });

  it('round-trips finite page settings and rejects malformed values', () => {
    const settings = {
      margins: { bottom: 48, left: 72, right: 72, top: 48 },
      preset: 'a4',
    } as const;

    expect(
      pageSettingsCodec.decode(pageSettingsCodec.encode(settings))
    ).toEqual(settings);
    expect(() =>
      pageSettingsCodec.decode({ margins: Number.NaN, preset: 'a4' })
    ).toThrow(/Invalid Plite page margins/);
    expect(() =>
      pageSettingsCodec.decode({ margins: 72, preset: 'legal' })
    ).toThrow(/Invalid Plite page settings/);
  });
});

describe('measurePages', () => {
  it('derives one immutable snapshot without subscribing or publishing', () => {
    const editor = createEditor({ initialValue: [paragraph('Read only.')] });
    const engine = createEstimatedPageLayoutEngine();
    const version = editor.read((state) => state.runtime.snapshot().version);
    const { subscribeCommit } = editor;
    let subscriptions = 0;

    editor.subscribeCommit = (listener) => {
      subscriptions += 1;
      return subscribeCommit(listener);
    };
    const snapshot = measurePages(editor, {
      engine,
      page: defaultPage,
    });

    expect(Object.isFrozen(engine)).toBe(true);
    expect(subscriptions).toBe(0);
    expect(editor.read((state) => state.runtime.snapshot().version)).toBe(
      version
    );
    expect(snapshot).toMatchObject({
      pages: [{ height: 1056, index: 0, width: 816 }],
      settings: defaultPage,
      version,
    });
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.fragments[0])).toBe(true);
    expect(Object.isFrozen(snapshot.fragments[0]?.rect)).toBe(true);
    expect(Object.isFrozen(snapshot.pages[0]?.content)).toBe(true);
  });

  it('reads page settings from one editor state field', () => {
    const field = defineStateField<PageSettings>({
      collab: 'shared',
      history: 'push',
      initial: () => ({ margins: 96, preset: 'a4' }),
      key: 'page.settings',
      persist: pageSettingsCodec,
    });
    const editor = createEditor({
      initialValue: [paragraph('State field.')],
      plugins: [definePlugin('page-settings', { stateFields: [field] })],
    });
    const snapshot = measurePages(editor, {
      engine: createEstimatedPageLayoutEngine(),
      page: field,
    });

    expect(snapshot.settings).toEqual({ margins: 96, preset: 'a4' });
  });

  it('preserves named-root identity on the snapshot and every text range', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('Main')],
        roots: { header: [paragraph('Header')] },
      },
    });
    const snapshot = measurePages(editor, {
      engine: createEstimatedPageLayoutEngine(),
      page: defaultPage,
      root: 'header',
    });

    expect(snapshot.root).toBe('header');
    expect(textRanges(snapshot.fragments)).toEqual([
      { end: 6, path: [0, 0], start: 0 },
    ]);
    const fragment = snapshot.fragments[0];

    expect(fragment?.type).toBe('text');
    if (fragment?.type === 'text') {
      expect(fragment.lines[0]?.source.anchor.root).toBe('header');
      expect(fragment.lines[0]?.runs[0]?.source.focus.root).toBe('header');
    }
  });

  it('rejects the internal main-root spelling', () => {
    const editor = createEditor({ initialValue: [paragraph('Main')] });

    expect(() =>
      measurePages(editor, {
        engine: createEstimatedPageLayoutEngine(),
        page: defaultPage,
        root: 'main' as never,
      })
    ).toThrow(/Omit root to target the primary document/);
  });

  it('conserves hard breaks, trailing spaces, and empty insertion positions', () => {
    const editor = createEditor({
      initialValue: [paragraph('alpha\nbeta  '), paragraph('')],
    });
    const snapshot = measurePages(editor, {
      engine: createEstimatedPageLayoutEngine(),
      page: defaultPage,
    });

    expect(textRanges(snapshot.fragments)).toEqual([
      { end: 6, path: [0, 0], start: 0 },
      { end: 12, path: [0, 0], start: 6 },
      { end: 0, path: [1, 0], start: 0 },
    ]);
  });

  it('keeps wrapped line sources on the runs before an exact leaf boundary', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [
            { text: 'a'.repeat(42) },
            { text: 'b'.repeat(42) },
            { text: 'c'.repeat(42) },
          ],
          type: 'paragraph',
        },
      ],
    });
    const snapshot = measurePages(editor, {
      engine: createEstimatedPageLayoutEngine(),
      page: defaultPage,
    });
    const fragment = snapshot.fragments[0];

    expect(fragment?.type).toBe('text');
    if (fragment?.type === 'text') {
      const firstLine = fragment.lines[0];

      expect(firstLine?.source.focus).toEqual({ offset: 42, path: [0, 1] });
      expect(firstLine?.runs.at(-1)?.source.focus).toEqual(
        firstLine?.source.focus
      );
    }
  });

  it('lowers atomic owners and exact direct children without caller paths', () => {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: '' }], height: 80, type: 'image' },
        {
          children: [
            { children: [paragraph('A')], type: 'row' },
            { children: [paragraph('B')], type: 'row' },
          ],
          type: 'table',
        },
      ],
    });
    const fragmentation: NodeFragmentationProvider<
      ElementOf<typeof editor>
    > = ({ content, element }) => {
      if (element.type === 'image') {
        return {
          size: { height: element.height, width: content.width },
          type: 'atomic',
        };
      }
      if (element.type === 'table') {
        return {
          sizes: element.children.map(() => ({
            height: 40,
            width: content.width,
          })),
          type: 'direct-children',
        };
      }
      return undefined;
    };
    const snapshot = measurePages(editor, {
      engine: createEstimatedPageLayoutEngine(),
      fragmentation,
      page: {
        margins: { bottom: 500, left: 72, right: 72, top: 500 },
        preset: 'letter',
      },
    });

    expect(snapshot.fragments).toEqual([
      expect.objectContaining({ path: [0], type: 'atomic' }),
      expect.objectContaining({
        children: [expect.objectContaining({ path: [1, 0] })],
        pageIndex: 1,
        path: [1],
        type: 'direct-children',
      }),
      expect.objectContaining({
        children: [expect.objectContaining({ path: [1, 1] })],
        pageIndex: 2,
        path: [1],
        type: 'direct-children',
      }),
    ]);
  });

  it('requires explicit truthful fragmentation for non-inline structures', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ children: [paragraph('Nested')], type: 'row' }],
          type: 'table',
        },
      ],
    });

    expect(() =>
      measurePages(editor, {
        engine: createEstimatedPageLayoutEngine(),
        page: defaultPage,
      })
    ).toThrow(/explicit fragmentation plan/);
    expect(() =>
      measurePages(editor, {
        engine: createEstimatedPageLayoutEngine(),
        fragmentation: () => ({ type: 'text' }),
        page: defaultPage,
      })
    ).toThrow(/supported inline flow/);
  });

  it.each([
    {
      expected: /one size for every element child/,
      plan: { sizes: [], type: 'direct-children' as const },
    },
    {
      expected: /finite and nonnegative/,
      plan: {
        sizes: [{ height: -1, width: 20 }],
        type: 'direct-children' as const,
      },
    },
  ])('rejects malformed direct-child plans', ({ expected, plan }) => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ children: [paragraph('Row')], type: 'row' }],
          type: 'table',
        },
      ],
    });

    expect(() =>
      measurePages(editor, {
        engine: createEstimatedPageLayoutEngine(),
        fragmentation: () => plan,
        page: defaultPage,
      })
    ).toThrow(expected);
  });

  it('rejects direct-child plans over text siblings and invalid atomic sizes', () => {
    const paragraphEditor = createEditor({
      initialValue: [paragraph('Text child')],
    });
    const imageEditor = createEditor({
      initialValue: [{ children: [{ text: '' }], type: 'image' }],
    });

    expect(() =>
      measurePages(paragraphEditor, {
        engine: createEstimatedPageLayoutEngine(),
        fragmentation: () => ({
          sizes: [{ height: 20, width: 20 }],
          type: 'direct-children',
        }),
        page: defaultPage,
      })
    ).toThrow(/element child/);
    expect(() =>
      measurePages(imageEditor, {
        engine: createEstimatedPageLayoutEngine(),
        fragmentation: () => ({
          size: { height: Number.POSITIVE_INFINITY, width: 20 },
          type: 'atomic',
        }),
        page: defaultPage,
      })
    ).toThrow(/finite and nonnegative/);
  });

  it('keeps fitting text together and splits taller-than-page text', () => {
    const editor = createEditor({
      initialValue: [
        paragraph('first'),
        paragraph('second'),
        paragraph('x'.repeat(220)),
      ],
    });
    const snapshot = measurePages(editor, {
      engine: createEstimatedPageLayoutEngine(),
      fragmentation: ({ path }) => ({
        keepTogether: path[0] !== 0,
        type: 'text',
      }),
      page: {
        margins: { bottom: 493, left: 72, right: 72, top: 493 },
        preset: 'letter',
      },
      typography: {
        block: () => ({ blockSpacing: 10, lineHeight: 30 }),
      },
    });
    const fragmentsByPath = (index: number) =>
      snapshot.fragments.filter((fragment) => fragment.path[0] === index);

    expect(fragmentsByPath(0)[0]?.pageIndex).toBe(0);
    expect(fragmentsByPath(1)[0]?.pageIndex).toBe(1);
    expect(
      new Set(fragmentsByPath(2).map((fragment) => fragment.pageIndex)).size
    ).toBeGreaterThan(1);
  });

  it('places oversized content once and following content on a new page', () => {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: '' }], type: 'image' },
        paragraph('after'),
      ],
    });
    const snapshot = measurePages(editor, {
      engine: createEstimatedPageLayoutEngine(),
      fragmentation: ({ content, element }) =>
        element.type === 'image'
          ? {
              size: { height: content.height + 50, width: content.width + 25 },
              type: 'atomic',
            }
          : undefined,
      page: defaultPage,
    });

    expect(snapshot.fragments[0]).toMatchObject({
      pageIndex: 0,
      path: [0],
      type: 'atomic',
    });
    expect(snapshot.fragments[1]).toMatchObject({
      pageIndex: 1,
      path: [1],
      type: 'text',
    });
  });
});

describe('custom PageLayoutEngine validation', () => {
  const editor = createEditor({ initialValue: [paragraph('Engine contract')] });

  it('freezes neutral engine input and detaches returned output', () => {
    const base = createEstimatedPageLayoutEngine();
    let output: ReturnType<PageLayoutEngine['compose']> | undefined;
    const engine: PageLayoutEngine = {
      compose(input) {
        expect(Object.isFrozen(input.blocks)).toBe(true);
        expect(Object.isFrozen(input.blocks[0]?.path)).toBe(true);
        const path = input.blocks[0]?.path;

        if (!path) throw new Error('Expected an input block.');
        expect(() => {
          (path as number[])[0] = 9;
        }).toThrow();
        output = base.compose(input);
        return output;
      },
    };
    const snapshot = measurePages(editor, { engine, page: defaultPage });

    if (!output) throw new Error('Expected engine output.');
    const outputRect = output.fragments[0]?.rect;

    if (!outputRect) throw new Error('Expected an output fragment.');
    const originalTop = snapshot.fragments[0]?.rect.top;
    (outputRect as { top: number }).top = 999;
    expect(snapshot.fragments[0]?.rect.top).toBe(originalTop);
  });

  it.each([
    {
      change(fragment: PageLayoutFragment): PageLayoutFragment {
        return { ...fragment, path: [99] };
      },
      expected: /foreign fragment/,
    },
    {
      change(fragment: PageLayoutFragment): PageLayoutFragment {
        return { ...fragment, pageIndex: 4 };
      },
      expected: /fragment for no page/,
    },
    {
      change(fragment: PageLayoutFragment): PageLayoutFragment {
        if (fragment.type !== 'text') return fragment;
        return { ...fragment, rect: { ...fragment.rect, height: 1 } };
      },
      expected: /inconsistent fragment geometry/,
    },
  ])('rejects invalid engine output', ({ change, expected }) => {
    const base = createEstimatedPageLayoutEngine();
    const engine: PageLayoutEngine = {
      compose(input) {
        const output = base.compose(input);
        return {
          ...output,
          fragments: [change(output.fragments[0]!)],
        };
      },
    };

    expect(() => measurePages(editor, { engine, page: defaultPage })).toThrow(
      expected
    );
  });
});
