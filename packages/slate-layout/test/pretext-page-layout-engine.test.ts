import { describe, expect, it } from 'bun:test';

import {
  createSlatePage,
  pretextPageLayoutEngine,
  type SlatePageLayoutBlock,
} from '../src';

class TestCanvasRenderingContext2D {
  font = '';

  measureText(text: string): { width: number } {
    const fontSize = Number(this.font.match(/(\d+(?:\.\d+)?)px/)?.[1] ?? 16);
    const textWidth = /700/.test(this.font)
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

class TestOffscreenCanvas {
  getContext(_kind: string): TestCanvasRenderingContext2D {
    return new TestCanvasRenderingContext2D();
  }
}

describe('pretextPageLayoutEngine', () => {
  it('emits a zero-width line for an empty editable block', () => {
    Reflect.set(globalThis, 'OffscreenCanvas', TestOffscreenCanvas);
    const settings = { margins: 96, preset: 'a4' } as const;
    const page = createSlatePage(settings);
    const block: SlatePageLayoutBlock = {
      element: {
        type: 'paragraph',
        children: [{ text: '' }],
      },
      lineHeight: 24,
      path: [0],
      spacingAfter: 12,
      text: '',
      textStyle: {
        font: '400 16px Arial',
        letterSpacing: 0,
      },
    };

    const output = pretextPageLayoutEngine().compose({
      blocks: [block],
      page,
      settings,
      version: 1,
    });

    expect(output.fragments).toHaveLength(1);
    expect(output.fragments[0]!.lines).toEqual([
      {
        end: 0,
        height: 24,
        start: 0,
        text: '',
        top: page.content.top,
        width: 0,
      },
    ]);
  });

  it('keeps trailing editable spaces in the projected line range', () => {
    Reflect.set(globalThis, 'OffscreenCanvas', TestOffscreenCanvas);
    const settings = { margins: 96, preset: 'a4' } as const;
    const page = createSlatePage(settings);
    const block: SlatePageLayoutBlock = {
      element: {
        type: 'paragraph',
        children: [{ text: 'Text   ' }],
      },
      lineHeight: 24,
      path: [0],
      spacingAfter: 12,
      text: 'Text   ',
      textStyle: {
        font: '400 16px Arial',
        letterSpacing: 0,
      },
    };

    const output = pretextPageLayoutEngine().compose({
      blocks: [block],
      page,
      settings,
      version: 1,
    });

    expect(output.fragments[0]!.lines[0]).toMatchObject({
      end: block.text.length,
      start: 0,
      text: block.text,
    });
    expect(output.fragments[0]!.lines[0]!.width).toBeGreaterThan(0);
  });

  it('positions mixed inline runs with their own measured fonts', () => {
    Reflect.set(globalThis, 'OffscreenCanvas', TestOffscreenCanvas);
    const settings = { margins: 96, preset: 'a4' } as const;
    const page = createSlatePage(settings);
    const block: SlatePageLayoutBlock = {
      element: {
        type: 'paragraph',
        children: [
          { text: 'one ' },
          { text: 'two', bold: true },
          { text: ' code', code: true },
        ],
      },
      lineHeight: 24,
      path: [0],
      runs: [
        {
          id: '0.0:0-4',
          path: [0, 0],
          range: { end: 4, start: 0 },
          text: 'one ',
          textStyle: {
            font: '400 16px Arial',
            letterSpacing: 0,
          },
        },
        {
          id: '0.1:4-7',
          path: [0, 1],
          range: { end: 7, start: 4 },
          text: 'two',
          textStyle: {
            font: '700 16px Arial',
            letterSpacing: 0,
          },
        },
        {
          id: '0.2:7-12',
          path: [0, 2],
          range: { end: 12, start: 7 },
          text: ' code',
          textStyle: {
            font: '400 16px Menlo, monospace',
            letterSpacing: 0,
          },
        },
      ],
      spacingAfter: 12,
      text: 'one two code',
      textStyle: {
        font: '400 16px Arial',
        letterSpacing: 0,
      },
    };

    const output = pretextPageLayoutEngine().compose({
      blocks: [block],
      page,
      settings,
      version: 1,
    });
    const line = output.fragments[0]!.lines[0]!;

    expect(line.runs).toHaveLength(3);
    expect(line.runs![0]!).toMatchObject({
      left: 0,
      path: [0, 0],
      text: 'one ',
    });
    expect(line.runs![0]!.width).toBeCloseTo(34.08);
    expect(line.runs![1]!).toMatchObject({
      path: [0, 1],
      text: 'two',
    });
    expect(line.runs![1]!.left).toBeCloseTo(34.08);
    expect(line.runs![1]!.width).toBeCloseTo(31.2);
    expect(line.runs![2]!).toMatchObject({
      path: [0, 2],
      text: ' code',
    });
    expect(line.runs![2]!.left).toBeCloseTo(65.28);
    expect(line.runs![2]!.width).toBeCloseTo(50.08);
    expect(line.width).toBeCloseTo(115.36);
  });

  it('keeps long source blocks logical while projecting them into page fragments', () => {
    Reflect.set(globalThis, 'OffscreenCanvas', TestOffscreenCanvas);
    const settings = { margins: 96, preset: 'a4' } as const;
    const page = createSlatePage(settings);
    const block: SlatePageLayoutBlock = {
      element: {
        type: 'paragraph',
        children: [{ text: 'One '.repeat(5000) }],
      },
      lineHeight: 24,
      path: [0],
      spacingAfter: 12,
      text: 'One '.repeat(5000),
      textStyle: {
        font: '400 16px Arial',
        letterSpacing: 0,
      },
    };

    const output = pretextPageLayoutEngine().compose({
      blocks: [block],
      page,
      settings,
      version: 1,
    });

    expect(output.pages.length).toBeGreaterThan(1);
    expect(output.fragments.length).toBeGreaterThan(1);
    expect(output.fragments.every((fragment) => fragment.path[0] === 0)).toBe(
      true
    );
    expect(output.fragments[0]!.lines.length).toBeGreaterThan(0);
    expect(output.fragments[0]!.lines[0]!.end).toBeGreaterThan(
      output.fragments[0]!.lines[0]!.start
    );
    expect(output.fragments[0]!.lines[0]!.top).toBe(page.content.top);
  });

  it('paginates unit-owned blocks without text measurement', () => {
    let measureCalls = 0;

    class CountingCanvasRenderingContext2D {
      font = '';

      measureText(text: string): { width: number } {
        measureCalls++;
        return { width: text.length * 10 };
      }
    }

    class CountingOffscreenCanvas {
      getContext(_kind: string): CountingCanvasRenderingContext2D {
        return new CountingCanvasRenderingContext2D();
      }
    }

    Reflect.set(globalThis, 'OffscreenCanvas', CountingOffscreenCanvas);
    const settings = { margins: 96, preset: 'a4' } as const;
    const page = createSlatePage(settings);
    const block: SlatePageLayoutBlock = {
      element: {
        type: 'table',
        children: [],
      },
      lineHeight: 24,
      path: [0],
      spacingAfter: 12,
      text: 'ignored by unit layout',
      textStyle: {
        font: '400 16px Arial',
        letterSpacing: 0,
      },
      units: Array.from({ length: 40 }, (_, index) => ({
        key: `row-${index}`,
        kind: 'table-row',
        path: [0, index],
        rect: {
          height: 36,
          left: 0,
          top: index * 36,
          width: page.content.width,
        },
        split: 'avoid',
      })),
    };

    const output = pretextPageLayoutEngine().compose({
      blocks: [block],
      page,
      settings,
      version: 1,
    });

    expect(measureCalls).toBe(0);
    expect(output.fragments.length).toBeGreaterThan(1);
    expect(
      output.fragments.every((fragment) => fragment.lines.length === 0)
    ).toBe(true);
    expect(
      output.fragments.flatMap((fragment) => fragment.units ?? [])
    ).toHaveLength(40);
  });

  it('reuses measured text blocks across path shifts', () => {
    Reflect.set(globalThis, 'OffscreenCanvas', TestOffscreenCanvas);
    const settings = { margins: 96, preset: 'a4' } as const;
    const page = createSlatePage(settings);
    const engine = pretextPageLayoutEngine();
    const events: { id: string; kind: string }[] = [];
    const previousProfiler = (
      globalThis as typeof globalThis & {
        __SLATE_REACT_RENDER_PROFILER__?: unknown;
      }
    ).__SLATE_REACT_RENDER_PROFILER__;
    const createBlock = (index: number): SlatePageLayoutBlock => ({
      element: {
        type: 'paragraph',
        children: [{ text: 'Path shifted text keeps the same line layout.' }],
      },
      lineHeight: 24,
      path: [index],
      runs: [
        {
          id: `${index}.0:0-43`,
          path: [index, 0],
          range: { end: 43, start: 0 },
          text: 'Path shifted text keeps the same line layout.',
          textStyle: {
            font: '400 16px Arial',
            letterSpacing: 0,
          },
        },
      ],
      spacingAfter: 12,
      text: 'Path shifted text keeps the same line layout.',
      textStyle: {
        font: '400 16px Arial',
        letterSpacing: 0,
      },
    });

    (
      globalThis as typeof globalThis & {
        __SLATE_REACT_RENDER_PROFILER__?: {
          record: (event: { id: string; kind: string }) => void;
        };
      }
    ).__SLATE_REACT_RENDER_PROFILER__ = {
      record: (event) => events.push(event),
    };

    try {
      engine.compose({
        blocks: [createBlock(0)],
        page,
        settings,
        version: 1,
      });
      const output = engine.compose({
        blocks: [createBlock(1)],
        page,
        settings,
        version: 2,
      });

      expect(
        events.some((event) => event.id === 'measured-block-cache-hit')
      ).toBe(true);
      expect(output.fragments[0]!.path).toEqual([1]);
      expect(output.fragments[0]!.lines[0]!.runs![0]!.path).toEqual([1, 0]);
    } finally {
      (
        globalThis as typeof globalThis & {
          __SLATE_REACT_RENDER_PROFILER__?: unknown;
        }
      ).__SLATE_REACT_RENDER_PROFILER__ = previousProfiler;
    }
  });

  it('remaps cached measured runs that do not carry their source path', () => {
    Reflect.set(globalThis, 'OffscreenCanvas', TestOffscreenCanvas);
    const settings = { margins: 96, preset: 'a4' } as const;
    const page = createSlatePage(settings);
    const engine = pretextPageLayoutEngine();
    const createBlock = (index: number): SlatePageLayoutBlock => ({
      element: {
        type: 'paragraph',
        children: [{ text: 'Pathless measured run still maps to text.' }],
      },
      lineHeight: 24,
      path: [index],
      runs: [
        {
          id: `${index}.0:0-38`,
          range: { end: 38, start: 0 },
          text: 'Pathless measured run still maps to text.',
          textStyle: {
            font: '400 16px Arial',
            letterSpacing: 0,
          },
        } as SlatePageLayoutBlock['runs'][number],
      ],
      spacingAfter: 12,
      text: 'Pathless measured run still maps to text.',
      textStyle: {
        font: '400 16px Arial',
        letterSpacing: 0,
      },
    });

    engine.compose({
      blocks: [createBlock(0)],
      page,
      settings,
      version: 1,
    });
    const output = engine.compose({
      blocks: [createBlock(1)],
      page,
      settings,
      version: 2,
    });

    expect(output.fragments[0]!.path).toEqual([1]);
    expect(output.fragments[0]!.lines[0]!.runs![0]!.path).toEqual([1, 0]);
  });

  it('reuses measured boxed blocks across path shifts', () => {
    Reflect.set(globalThis, 'OffscreenCanvas', TestOffscreenCanvas);
    const settings = { margins: 96, preset: 'a4' } as const;
    const page = createSlatePage(settings);
    const engine = pretextPageLayoutEngine();
    const events: { id: string; kind: string }[] = [];
    const previousProfiler = (
      globalThis as typeof globalThis & {
        __SLATE_REACT_RENDER_PROFILER__?: unknown;
      }
    ).__SLATE_REACT_RENDER_PROFILER__;
    const createBlock = (index: number): SlatePageLayoutBlock => ({
      boxes: [
        {
          kind: 'block',
          path: [index],
          rect: {
            height: 24,
            left: 0,
            top: 0,
            width: page.content.width,
          },
          split: 'avoid',
        },
      ],
      element: {
        type: 'code-block',
        children: [{ text: 'const shifted = true' }],
      },
      lineHeight: 24,
      path: [index],
      runs: [
        {
          id: `${index}.0:0-20`,
          path: [index, 0],
          range: { end: 20, start: 0 },
          text: 'const shifted = true',
          textStyle: {
            font: '400 16px Menlo, monospace',
            letterSpacing: 0,
          },
        },
      ],
      spacingAfter: 12,
      text: 'const shifted = true',
      textStyle: {
        font: '400 16px Menlo, monospace',
        letterSpacing: 0,
      },
    });

    (
      globalThis as typeof globalThis & {
        __SLATE_REACT_RENDER_PROFILER__?: {
          record: (event: { id: string; kind: string }) => void;
        };
      }
    ).__SLATE_REACT_RENDER_PROFILER__ = {
      record: (event) => events.push(event),
    };

    try {
      engine.compose({
        blocks: [createBlock(0)],
        page,
        settings,
        version: 1,
      });
      const output = engine.compose({
        blocks: [createBlock(1)],
        page,
        settings,
        version: 2,
      });

      expect(
        events.some((event) => event.id === 'measured-block-cache-hit')
      ).toBe(true);
      expect(output.fragments[0]!.path).toEqual([1]);
      expect(output.fragments[0]!.lines[0]!.runs![0]!.path).toEqual([1, 0]);
    } finally {
      (
        globalThis as typeof globalThis & {
          __SLATE_REACT_RENDER_PROFILER__?: unknown;
        }
      ).__SLATE_REACT_RENDER_PROFILER__ = previousProfiler;
    }
  });

  it('estimates cold blocks without measured cache keying', () => {
    Reflect.set(globalThis, 'OffscreenCanvas', TestOffscreenCanvas);
    const settings = { margins: 96, preset: 'a4' } as const;
    const page = createSlatePage(settings);
    const engine = pretextPageLayoutEngine({ estimateBlock: () => true });
    const events: { id: string; kind: string }[] = [];
    const previousProfiler = (
      globalThis as typeof globalThis & {
        __SLATE_REACT_RENDER_PROFILER__?: unknown;
      }
    ).__SLATE_REACT_RENDER_PROFILER__;
    const createBlock = (index: number): SlatePageLayoutBlock => ({
      element: {
        type: 'paragraph',
        children: [{ text: 'Estimated cold content keeps stable height.' }],
      },
      lineHeight: 24,
      path: [index],
      spacingAfter: 12,
      text: 'Estimated cold content keeps stable height.',
      textStyle: {
        font: '400 16px Arial',
        letterSpacing: 0,
      },
    });

    (
      globalThis as typeof globalThis & {
        __SLATE_REACT_RENDER_PROFILER__?: {
          record: (event: { id: string; kind: string }) => void;
        };
      }
    ).__SLATE_REACT_RENDER_PROFILER__ = {
      record: (event) => events.push(event),
    };

    try {
      engine.compose({
        blocks: [createBlock(0)],
        page,
        settings,
        version: 1,
      });
      const output = engine.compose({
        blocks: [createBlock(1)],
        page,
        settings,
        version: 2,
      });

      expect(
        events.some((event) => event.id === 'measured-block-cache-hit')
      ).toBe(false);
      expect(
        events.some((event) => event.id === 'measured-block-cache-miss')
      ).toBe(false);
      expect(output.fragments[0]!.path).toEqual([1]);
    } finally {
      (
        globalThis as typeof globalThis & {
          __SLATE_REACT_RENDER_PROFILER__?: unknown;
        }
      ).__SLATE_REACT_RENDER_PROFILER__ = previousProfiler;
    }
  });
});
