import type { NodeKey } from '@platejs/plite';
import { describe, expect, it } from 'vitest';

import { createSegmentPlan } from '../src/dom-strategy/create-segment-plan';

const nodeKeys = ['a' as NodeKey];

describe('createSegmentPlan', () => {
  it('rejects invalid segment sizes before planning segments', () => {
    for (const segmentSize of [0, -1]) {
      expect(() =>
        createSegmentPlan({
          defaultActiveSegmentIndex: 0,
          overscan: 0,
          promotedSegmentIndex: null,
          segmentSize,
          topLevelNodeKeys: nodeKeys,
        })
      ).toThrow(RangeError);
    }
  });
});
