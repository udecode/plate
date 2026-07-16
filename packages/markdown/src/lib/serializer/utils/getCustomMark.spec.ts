import { getCustomMark } from './getCustomMark';

describe('getCustomMark', () => {
  it('returns only rules explicitly marked as markdown marks', () => {
    expect(
      getCustomMark({
        rules: {
          bold: { mark: true },
          callout: {},
          comment: { mark: true },
          mention: { mark: false },
        },
      })
    ).toEqual(['bold', 'comment']);
  });

  it('returns an empty list when rules are missing', () => {
    expect(getCustomMark()).toEqual([]);
  });
});
