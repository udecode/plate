import { getCustomMark } from './getCustomMark';

describe('getCustomMark', () => {
  it('returns only rules explicitly marked as markdown marks', () => {
    expect(
      getCustomMark({
        rules: {
          bold: { mark: true } as any,
          callout: {} as any,
          comment: { mark: true } as any,
          mention: { mark: false } as any,
        },
      })
    ).toEqual(['bold', 'comment']);
  });

  it('returns an empty list when rules are missing', () => {
    expect(getCustomMark()).toEqual([]);
  });
});
