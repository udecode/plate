import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  mock,
} from 'bun:test';

const scrollIntoViewIfNeeded = mock();

mock.module('scroll-into-view-if-needed', () => ({
  default: scrollIntoViewIfNeeded,
}));

const { scrollIntoView } = await import('./scrollIntoView');

describe('scrollIntoView', () => {
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const originalSetTimeout = globalThis.setTimeout;

  beforeAll(() => {
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(0);

      return 1;
    }) as typeof requestAnimationFrame;
    globalThis.setTimeout = ((cb: TimerHandler) => {
      if (typeof cb === 'function') cb();

      return 1 as any;
    }) as typeof setTimeout;
  });

  beforeEach(() => {
    scrollIntoViewIfNeeded.mockClear();
  });

  afterEach(() => {
    scrollIntoViewIfNeeded.mockClear();
  });

  afterAll(() => {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    globalThis.setTimeout = originalSetTimeout;
  });

  it('converts a point target into a DOM range and scrolls with custom options', () => {
    const leafEl: any = {};
    const domRange = {
      getBoundingClientRect: () => ({
        bottom: 1,
        height: 1,
        left: 0,
        right: 1,
        top: 0,
        width: 1,
      }),
      startContainer: { parentElement: leafEl },
    };
    const editor = {
      api: {
        toDOMRange: mock(() => domRange),
      },
    } as any;
    const options = { block: 'nearest', scrollMode: 'if-needed' } as any;

    scrollIntoView(editor, { offset: 2, path: [0, 0] }, options);

    expect(editor.api.toDOMRange).toHaveBeenCalledWith({
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });
    expect(scrollIntoViewIfNeeded).toHaveBeenCalledWith(leafEl, options);
    expect(leafEl.getBoundingClientRect).toBeUndefined();
  });

  it('returns early when the point cannot be converted to a DOM range', () => {
    const editor = {
      api: {
        toDOMRange: mock(() => {}),
      },
    } as any;

    scrollIntoView(editor, { offset: 0, path: [0, 0] });

    expect(editor.api.toDOMRange).toHaveBeenCalled();
    expect(scrollIntoViewIfNeeded).not.toHaveBeenCalled();
  });

  it('accepts an existing DOM range target and uses default options', () => {
    const leafEl: any = {};
    const domRange = {
      getBoundingClientRect: () => ({
        bottom: 1,
        height: 1,
        left: 0,
        right: 1,
        top: 0,
        width: 1,
      }),
      startContainer: { parentElement: leafEl },
    };
    const editor = {
      api: {
        toDOMRange: mock(() => {}),
      },
    } as any;

    scrollIntoView(editor, domRange as any);

    expect(editor.api.toDOMRange).not.toHaveBeenCalled();
    expect(scrollIntoViewIfNeeded).toHaveBeenCalledWith(leafEl, {
      scrollMode: 'if-needed',
    });
    expect(leafEl.getBoundingClientRect).toBeUndefined();
  });
});
