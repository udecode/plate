import { describe, expect, it } from 'bun:test';

import { createEditor } from 'plitejs';

import {
  createPretextPageLayoutEngine,
  measurePages,
} from '../../src/pagination';

class TestCanvasRenderingContext2D {
  font = '';
  calls = 0;

  measureText(text: string): { width: number } {
    this.calls += 1;
    const fontSize = Number(this.font.match(/(\d+(?:\.\d+)?)px/)?.[1] ?? 16);
    const textWidth = this.font.includes('700')
      ? fontSize * 0.65
      : /Menlo|monospace/.test(this.font)
        ? fontSize * 0.7
        : fontSize * 0.6;
    let width = 0;

    for (const character of text) {
      width += character === ' ' ? fontSize * 0.33 : textWidth;
    }

    return { width };
  }
}

const canvasContext = new TestCanvasRenderingContext2D();

class TestOffscreenCanvas {
  getContext(_kind: string): TestCanvasRenderingContext2D {
    return canvasContext;
  }
}

const installCanvas = () => {
  canvasContext.calls = 0;
  Reflect.set(globalThis, 'OffscreenCanvas', TestOffscreenCanvas);
};

const paragraph = (children: ReadonlyArray<Record<string, unknown>>) => ({
  children,
  type: 'paragraph' as const,
});

const page = { margins: 96, preset: 'a4' } as const;

describe('createPretextPageLayoutEngine', () => {
  it('keeps an empty editable insertion position', () => {
    installCanvas();
    const editor = createEditor({
      initialValue: [paragraph([{ text: '' }])],
    });
    const snapshot = measurePages(editor, {
      engine: createPretextPageLayoutEngine(),
      page,
    });
    const fragment = snapshot.fragments[0];

    expect(fragment?.type).toBe('text');
    if (fragment?.type !== 'text') return;
    expect(fragment.lines).toEqual([
      {
        rect: { height: 24, left: 96, top: 96, width: 0 },
        runs: [
          {
            rect: { height: 24, left: 96, top: 96, width: 0 },
            source: {
              anchor: { offset: 0, path: [0, 0] },
              focus: { offset: 0, path: [0, 0] },
            },
          },
        ],
        source: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
      },
    ]);
  });

  it('conserves trailing spaces and hard breaks under pre-wrap', () => {
    installCanvas();
    const editor = createEditor({
      initialValue: [paragraph([{ text: 'alpha\nbeta   ' }])],
    });
    const snapshot = measurePages(editor, {
      engine: createPretextPageLayoutEngine(),
      page,
    });
    const fragment = snapshot.fragments[0];

    expect(fragment?.type).toBe('text');
    if (fragment?.type !== 'text') return;
    expect(
      fragment.lines.map((line) =>
        line.runs.map((run) => [
          run.source.anchor.offset,
          run.source.focus.offset,
        ])
      )
    ).toEqual([[[0, 6]], [[6, 13]]]);
    expect(fragment.lines[1]?.rect.width).toBeGreaterThan(0);
  });

  it('uses each inline run font and assigns collapsed whitespace once', () => {
    installCanvas();
    const editor = createEditor({
      initialValue: [
        paragraph([
          { text: 'alpha ' },
          { bold: true, text: 'beta' },
          { code: true, text: ' code' },
        ]),
      ],
    });
    const snapshot = measurePages(editor, {
      engine: createPretextPageLayoutEngine({ whiteSpace: 'normal' }),
      page: {
        margins: { bottom: 96, left: 358, right: 358, top: 96 },
        preset: 'letter',
      },
      typography: {
        text: ({ leaf }) => ({
          font: leaf.bold
            ? '700 16px Arial'
            : leaf.code
              ? '400 16px Menlo, monospace'
              : '400 16px Arial',
        }),
      },
    });
    const fragment = snapshot.fragments[0];

    expect(fragment?.type).toBe('text');
    if (fragment?.type !== 'text') return;
    expect(fragment.lines).toHaveLength(2);
    expect(
      fragment.lines[0]?.runs.map((run) => ({
        end: run.source.focus.offset,
        path: run.source.anchor.path,
        start: run.source.anchor.offset,
      }))
    ).toEqual([
      { end: 5, path: [0, 0], start: 0 },
      { end: 6, path: [0, 0], start: 5 },
      { end: 4, path: [0, 1], start: 0 },
      { end: 1, path: [0, 2], start: 0 },
    ]);
    expect(fragment.lines[0]?.runs[0]?.rect.width).toBeCloseTo(48);
    expect(fragment.lines[0]?.runs[1]?.rect.width).toBeCloseTo(5.28);
    expect(fragment.lines[0]?.runs[2]?.rect.width).toBeCloseTo(41.6);
    expect(fragment.lines[0]?.runs[3]?.rect.width).toBe(0);
    expect(fragment.lines[1]?.runs).toEqual([
      expect.objectContaining({
        source: {
          anchor: { offset: 1, path: [0, 2] },
          focus: { offset: 5, path: [0, 2] },
        },
      }),
    ]);
    expect(fragment.lines[1]?.runs[0]?.rect.width).toBeCloseTo(44.8);
  });

  it('can estimate selected cold blocks without canvas measurement', () => {
    class ThrowingCanvas {
      getContext() {
        return {
          font: '',
          measureText() {
            throw new Error('canvas measurement should be bypassed');
          },
        };
      }
    }

    Reflect.set(globalThis, 'OffscreenCanvas', ThrowingCanvas);
    const editor = createEditor({
      initialValue: [paragraph([{ text: 'abcdefghij' }])],
    });
    const snapshot = measurePages(editor, {
      engine: createPretextPageLayoutEngine({ estimateBlock: () => true }),
      page,
    });
    const fragment = snapshot.fragments[0];

    expect(fragment?.type).toBe('text');
    if (fragment?.type === 'text') {
      expect(fragment.lines[0]?.rect.width).toBe(80);
    }
  });

  it('bypasses text preparation for atomic and direct-child content', () => {
    installCanvas();
    const editor = createEditor({
      initialValue: [
        { children: [{ text: '' }], type: 'image' },
        {
          children: [
            { children: [paragraph([{ text: 'one' }])], type: 'row' },
            { children: [paragraph([{ text: 'two' }])], type: 'row' },
          ],
          type: 'table',
        },
      ],
    });
    const snapshot = measurePages(editor, {
      engine: createPretextPageLayoutEngine(),
      fragmentation: ({ content, element }) => {
        if (element.type === 'image') {
          return {
            size: { height: 40, width: content.width },
            type: 'atomic',
          };
        }
        if (element.type === 'table') {
          return {
            sizes: element.children.map(() => ({
              height: 32,
              width: content.width,
            })),
            type: 'direct-children',
          };
        }
        return undefined;
      },
      page,
    });

    expect(canvasContext.calls).toBe(0);
    expect(snapshot.fragments.map((fragment) => fragment.type)).toEqual([
      'atomic',
      'direct-children',
    ]);
  });

  it('remaps cached measured lines to current source paths', () => {
    installCanvas();
    const engine = createPretextPageLayoutEngine();
    const first = createEditor({
      initialValue: [paragraph([{ text: 'Reusable measured text.' }])],
    });
    const shifted = createEditor({
      initialValue: [
        paragraph([{ text: 'Prefix' }]),
        paragraph([{ text: 'Reusable measured text.' }]),
      ],
    });

    measurePages(first, { engine, page });
    const snapshot = measurePages(shifted, { engine, page });
    const fragment = snapshot.fragments.find(
      (candidate) => candidate.path[0] === 1
    );

    expect(fragment?.type).toBe('text');
    if (fragment?.type === 'text') {
      expect(fragment.lines[0]?.runs[0]?.source.anchor.path).toEqual([1, 0]);
    }
  });
});
