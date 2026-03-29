import { describe, expect, it } from 'bun:test';

import {
  getNextPlaybackIndex,
  getPlaybackDelayInMs,
} from '@/registry/lib/markdown-streaming-demo-data';

describe('getPlaybackDelayInMs', () => {
  it('uses the selected playback delay as the minimum interval', () => {
    expect(getPlaybackDelayInMs(50, 10)).toBe(50);
    expect(getPlaybackDelayInMs(16, undefined)).toBe(16);
  });

  it('preserves larger chunk-specific delays from the joiner', () => {
    expect(getPlaybackDelayInMs(10, 100)).toBe(100);
    expect(getPlaybackDelayInMs(50, 200)).toBe(200);
  });
});

describe('getNextPlaybackIndex', () => {
  it('advances by the selected burst size', () => {
    expect(getNextPlaybackIndex(0, 20, 1)).toBe(1);
    expect(getNextPlaybackIndex(0, 20, 5)).toBe(5);
    expect(getNextPlaybackIndex(3, 20, 10)).toBe(13);
  });

  it('caps the next index at the total chunk count', () => {
    expect(getNextPlaybackIndex(17, 20, 5)).toBe(20);
    expect(getNextPlaybackIndex(20, 20, 5)).toBe(20);
  });
});
