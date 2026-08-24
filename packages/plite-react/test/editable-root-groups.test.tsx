import type { NodeKey } from '@platejs/plite';
import { act, renderHook } from '@testing-library/react';

import {
  createRootGroups,
  useMountedRootGroupIds,
} from '../src/components/editable-root-groups';

const nodeKeys = ['a', 'b', 'c', 'd'] as unknown as NodeKey[];
const groups = createRootGroups(nodeKeys, 2);

describe('mounted editable root groups', () => {
  test('retains mounted groups until a document replacement resets them', () => {
    const { result, rerender } = renderHook(
      ({ activeGroupIds, documentEpoch, renderedGroups, planKey }) =>
        useMountedRootGroupIds({
          activeGroupIds,
          documentEpoch,
          groups: renderedGroups,
          planKey,
        }),
      {
        initialProps: {
          activeGroupIds: new Set(['0-1']),
          documentEpoch: 0,
          renderedGroups: groups,
          planKey: 'plan:a',
        },
      }
    );

    expect([...result.current.mountedGroupIds]).toEqual(['0-1']);

    act(() => {
      result.current.mountGroupIds(['2-3']);
    });

    expect([...result.current.mountedGroupIds]).toEqual(['0-1', '2-3']);

    rerender({
      activeGroupIds: new Set(['2-3']),
      documentEpoch: 0,
      renderedGroups: groups,
      planKey: 'plan:b',
    });

    expect([...result.current.mountedGroupIds]).toEqual(['0-1', '2-3']);

    rerender({
      activeGroupIds: new Set(['2-3']),
      documentEpoch: 1,
      renderedGroups: groups,
      planKey: 'plan:c',
    });

    expect([...result.current.mountedGroupIds]).toEqual(['2-3']);

    rerender({
      activeGroupIds: new Set(['0-1']),
      documentEpoch: 1,
      renderedGroups: groups.slice(0, 1),
      planKey: 'plan:d',
    });

    expect([...result.current.mountedGroupIds]).toEqual(['0-1']);

    rerender({
      activeGroupIds: new Set(),
      documentEpoch: 1,
      renderedGroups: null,
      planKey: null,
    });

    expect([...result.current.mountedGroupIds]).toEqual([]);
  });
});
