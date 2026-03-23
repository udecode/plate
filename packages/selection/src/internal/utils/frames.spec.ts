import { frames } from './frames';

describe('frames', () => {
  it('coalesces queued calls until the animation frame runs', () => {
    const callbackCalls: string[] = [];
    const callback = (...args: [string]) => {
      callbackCalls.push(...args);
    };
    const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
    const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
    const canceledHandles: number[] = [];
    let scheduledFrame: FrameRequestCallback | undefined;

    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      scheduledFrame = cb;
      return 7;
    }) as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = ((handle: number) => {
      canceledHandles.push(handle);
    }) as typeof cancelAnimationFrame;

    try {
      const frame = frames(callback);

      frame.next('first');
      frame.next('second');

      expect(callbackCalls).toEqual([]);

      scheduledFrame?.(0);

      expect(callbackCalls).toEqual(['second']);
    } finally {
      globalThis.requestAnimationFrame = originalRequestAnimationFrame;
      globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
    }
  });

  it('cancels the pending frame and allows rescheduling', () => {
    const callbackCalls: string[] = [];
    const callback = (...args: [string]) => {
      callbackCalls.push(...args);
    };
    const canceledHandles: number[] = [];
    const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
    const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
    let frameId = 0;
    let scheduledFrame: FrameRequestCallback | undefined;

    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      frameId += 1;
      scheduledFrame = cb;
      return frameId;
    }) as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = ((handle: number) => {
      canceledHandles.push(handle);
    }) as typeof cancelAnimationFrame;

    try {
      const frame = frames(callback);

      frame.next('first');
      frame.cancel();
      frame.next('second');

      expect(canceledHandles).toEqual([1]);

      scheduledFrame?.(0);

      expect(callbackCalls).toEqual(['second']);
    } finally {
      globalThis.requestAnimationFrame = originalRequestAnimationFrame;
      globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
    }
  });
});
