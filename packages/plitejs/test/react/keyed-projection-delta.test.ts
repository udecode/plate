import { describe, expect, it } from 'vitest';

import { getSnapshot as editorGetSnapshot } from '../../src/internal';
import { createEditor } from '../../src/react';
import {
  createPliteProjectionStore,
  type PliteProjection,
} from '../../src/react/projection-store';

const DELTA = Symbol.for('plitejs/react/keyed-projection-delta/v1');

describe('keyed projection delta', () => {
  it('maps and wakes only the changed projection at 1,000 items', () => {
    const editor = createEditor({
      initialValue: Array.from({ length: 1000 }, (_, index) => ({
        children: [{ text: `block ${index}` }],
        type: 'paragraph',
      })),
    });
    const projections = Array.from<unknown, PliteProjection>(
      { length: 1000 },
      (_, index) => ({
        data: { revision: 0 },
        key: `projection-${index}`,
        range: {
          anchor: { offset: 0, path: [index, 0] },
          focus: { offset: 1, path: [index, 0] },
        },
      })
    );
    let delta = {
      changedKeys: null as readonly string[] | null,
      revision: 0,
    };

    Object.defineProperty(projections, DELTA, {
      get: () => delta,
    });

    const store = createPliteProjectionStore(editor, () => projections, {
      dirtiness: 'external',
      sourceId: 'keyed-test',
    });
    const snapshot = editorGetSnapshot(editor);
    const changedNodeKey = snapshot.index.keyAt([0, 0]);
    const unrelatedNodeKey = snapshot.index.keyAt([999, 0]);

    expect(changedNodeKey).toBeDefined();
    expect(unrelatedNodeKey).toBeDefined();

    let changedWakes = 0;
    let unrelatedWakes = 0;
    store.subscribeNodeKey(changedNodeKey!, () => {
      changedWakes += 1;
    });
    store.subscribeNodeKey(unrelatedNodeKey!, () => {
      unrelatedWakes += 1;
    });
    const metricsBefore = store.getMetrics();

    projections[0] = {
      data: { revision: 1 },
      key: 'projection-0',
      range: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
    };
    delta = { changedKeys: ['projection-0'], revision: 1 };

    store.refresh({ reason: 'external' });

    const metricsAfter = store.getMetrics();

    expect(
      metricsAfter.projectedRangeCount - metricsBefore.projectedRangeCount
    ).toBe(1);
    expect(
      metricsAfter.changedRuntimeBucketCount -
        metricsBefore.changedRuntimeBucketCount
    ).toBe(1);
    expect(
      metricsAfter.runtimeSubscriberWakeCount -
        metricsBefore.runtimeSubscriberWakeCount
    ).toBe(1);
    expect(changedWakes).toBe(1);
    expect(unrelatedWakes).toBe(0);
    expect(store.getRuntimeSnapshot(changedNodeKey!)[0]).toMatchObject({
      data: { revision: 1 },
      end: 2,
      start: 1,
    });

    store.destroy();
  });
});
