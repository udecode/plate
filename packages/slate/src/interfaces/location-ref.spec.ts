import { PathRefApi, PointRefApi, RangeRefApi } from './location-ref';

describe('location refs', () => {
  it('keeps path refs in sync and unreferences removed paths', () => {
    const ref: any = {
      affinity: null,
      current: [1],
      unref() {
        this.wasUnref = true;

        return null;
      },
    };

    PathRefApi.transform(ref, {
      node: { text: 'x' },
      path: [0],
      type: 'insert_node',
    } as any);

    expect(ref.current).toEqual([2]);
    expect(ref.wasUnref).toBeUndefined();

    PathRefApi.transform(ref, {
      node: { text: 'x' },
      path: [2],
      type: 'remove_node',
    } as any);

    expect(ref.current).toBeNull();
    expect(ref.wasUnref).toBe(true);
  });

  it('ignores path refs that are already null', () => {
    const ref: any = {
      affinity: null,
      current: null,
      unref() {
        this.wasUnref = true;

        return null;
      },
    };

    PathRefApi.transform(ref, {
      node: { text: 'x' },
      path: [0],
      type: 'insert_node',
    } as any);

    expect(ref.current).toBeNull();
    expect(ref.wasUnref).toBeUndefined();
  });

  it('transforms point refs with Slate semantics', () => {
    const ref: any = {
      affinity: 'forward',
      current: { offset: 0, path: [1] },
      unref() {
        this.wasUnref = true;

        return null;
      },
    };

    PointRefApi.transform(ref, {
      node: { text: 'x' },
      path: [0],
      type: 'insert_node',
    } as any);

    expect(ref.current).toEqual({ offset: 0, path: [2] });
    expect(ref.wasUnref).toBeUndefined();
  });

  it('transforms range refs with Slate semantics', () => {
    const ref: any = {
      affinity: 'inward',
      current: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      unref() {
        this.wasUnref = true;

        return null;
      },
    };

    RangeRefApi.transform(ref, {
      path: [0, 0],
      position: 1,
      properties: {},
      type: 'split_node',
    } as any);

    expect(ref.current).toEqual({
      anchor: { offset: 0, path: [0, 1] },
      focus: { offset: 0, path: [0, 1] },
    });
    expect(ref.wasUnref).toBeUndefined();
  });
});
