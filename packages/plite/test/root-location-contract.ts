import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Operation, Range } from '../src';
import {
  getOperationRoot,
  getPointRoot,
  getRangeRoot,
  getSelectionPatchRoot,
  MAIN_ROOT_KEY,
  stripImplicitPointRoot,
  stripImplicitRangeRoots,
  withImplicitPointRoot,
  withImplicitRangeRoot,
} from '../src/internal/root-location';

describe('root location contract', () => {
  it('uses main as the implicit root for rootless operations and points', () => {
    const operation = {
      offset: 0,
      path: [0, 0],
      text: '!',
      type: 'insert_text',
    } satisfies Operation;
    const point = { path: [0, 0], offset: 1 };

    assert.equal(MAIN_ROOT_KEY, 'main');
    assert.equal(getOperationRoot(operation), 'main');
    assert.deepEqual(getPointRoot(point), {
      root: 'main',
      visibility: 'implicit',
    });
  });

  it('tracks explicit point roots separately from implicit fallback roots', () => {
    assert.deepEqual(
      getPointRoot({ path: [0, 0], offset: 1, root: 'header' }, 'main'),
      {
        root: 'header',
        visibility: 'explicit',
      }
    );
    assert.deepEqual(getPointRoot({ path: [0, 0], offset: 1 }, 'header'), {
      root: 'header',
      visibility: 'implicit',
    });
  });

  it('injects and strips only implicit point roots', () => {
    const rootless = { path: [0, 0], offset: 1 };
    const implicit = getPointRoot(rootless, 'header');
    const rooted = withImplicitPointRoot(rootless, implicit.root);

    assert.deepEqual(rooted, { path: [0, 0], offset: 1, root: 'header' });
    assert.deepEqual(stripImplicitPointRoot(rooted, implicit), rootless);

    const explicit = getPointRoot(
      { path: [0, 0], offset: 1, root: 'header' },
      'main'
    );

    assert.deepEqual(
      stripImplicitPointRoot(
        { path: [0, 0], offset: 1, root: 'header' },
        explicit
      ),
      { path: [0, 0], offset: 1, root: 'header' }
    );
  });

  it('resolves range roots from both edges and reports mismatches', () => {
    const rootless = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 2 },
    } satisfies Range;
    const mixed = {
      anchor: { path: [0, 0], offset: 1, root: 'header' },
      focus: { path: [0, 0], offset: 2, root: 'footer' },
    } satisfies Range;

    assert.deepEqual(getRangeRoot(rootless, 'header'), {
      anchor: { root: 'header', visibility: 'implicit' },
      focus: { root: 'header', visibility: 'implicit' },
      root: 'header',
    });
    assert.deepEqual(getRangeRoot(mixed, 'main'), {
      anchor: { root: 'header', visibility: 'explicit' },
      focus: { root: 'footer', visibility: 'explicit' },
      root: null,
    });
  });

  it('injects and strips only implicit range roots', () => {
    const range = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 2, root: 'header' },
    } satisfies Range;
    const meta = getRangeRoot(range, 'header');
    const rooted = withImplicitRangeRoot(range, 'header');

    assert.deepEqual(rooted, {
      anchor: { path: [0, 0], offset: 1, root: 'header' },
      focus: { path: [0, 0], offset: 2, root: 'header' },
    });
    assert.deepEqual(stripImplicitRangeRoots(rooted, meta), range);
  });

  it('infers selection patch roots only from the restored selection shape', () => {
    assert.equal(
      getSelectionPatchRoot({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      }),
      'main'
    );
    assert.equal(
      getSelectionPatchRoot(
        {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        },
        'header'
      ),
      'header'
    );
    assert.equal(
      getSelectionPatchRoot({
        anchor: { path: [0, 0], offset: 1, root: 'header' },
      }),
      'header'
    );
    assert.equal(
      getSelectionPatchRoot({
        anchor: { path: [0, 0], offset: 1, root: 'header' },
        focus: { path: [0, 0], offset: 1, root: 'footer' },
      }),
      undefined
    );
    assert.equal(getSelectionPatchRoot(null), undefined);
  });
});
