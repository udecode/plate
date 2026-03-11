import { getMarkBoundaryAffinity } from './getMarkBoundaryAffinity';

describe('getMarkBoundaryAffinity', () => {
  it('returns undefined without a selection', () => {
    expect(
      getMarkBoundaryAffinity({ marks: null, selection: null } as any, [
        undefined,
        undefined,
      ])
    ).toBeUndefined();
  });

  it('uses the only available leaf when a single boundary leaf exists', () => {
    expect(
      getMarkBoundaryAffinity(
        {
          marks: null,
          selection: {
            anchor: { offset: 0 },
          },
        } as any,
        [[{ bold: true, text: 'a' }, [0, 0]] as any, undefined]
      )
    ).toBe('backward');
  });

  it('returns undefined when the only leaf does not match the current marks', () => {
    expect(
      getMarkBoundaryAffinity(
        {
          marks: { bold: true, color: 'red' },
          selection: {
            anchor: { offset: 0 },
          },
        } as any,
        [[{ bold: true, color: 'blue', text: 'a' }, [0, 0]] as any, undefined]
      )
    ).toBeUndefined();
  });

  it('prefers forward when selection is backward and only the forward leaf matches marks', () => {
    expect(
      getMarkBoundaryAffinity(
        {
          marks: { bold: true, color: 'red' },
          selection: {
            anchor: { offset: 1 },
          },
        } as any,
        [
          [{ bold: true, color: 'blue', text: 'a' }, [0, 0]] as any,
          [{ bold: true, color: 'red', text: 'b' }, [0, 1]] as any,
        ]
      )
    ).toBe('forward');
  });

  it('falls back to backward when no special case applies', () => {
    expect(
      getMarkBoundaryAffinity(
        {
          marks: { bold: true, color: 'red' },
          selection: {
            anchor: { offset: 1 },
          },
        } as any,
        [
          [{ bold: true, color: 'red', text: 'a' }, [0, 0]] as any,
          [{ bold: true, color: 'blue', text: 'b' }, [0, 1]] as any,
        ]
      )
    ).toBe('backward');
  });
});
