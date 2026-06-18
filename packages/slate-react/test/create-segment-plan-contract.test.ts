import type { RuntimeId } from '@platejs/slate';
import { describe, expect, it } from 'vitest';

import { createSegmentPlan } from '../src/dom-strategy/create-segment-plan';

const runtimeIds = ['a' as RuntimeId];

describe('createSegmentPlan', () => {
  it('rejects invalid segment sizes before planning segments', () => {
    for (const segmentSize of [0, -1]) {
      expect(() =>
        createSegmentPlan({
          defaultActiveSegmentIndex: 0,
          overscan: 0,
          promotedSegmentIndex: null,
          segmentSize,
          topLevelRuntimeIds: runtimeIds,
        })
      ).toThrow(RangeError);
    }
  });
});
