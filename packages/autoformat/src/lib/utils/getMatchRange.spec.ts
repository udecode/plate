import { getMatchRange } from './getMatchRange';

describe('getMatchRange', () => {
  it('derives the end string and trigger from a shorthand string match', () => {
    expect(getMatchRange({ match: '**', trigger: undefined })).toEqual({
      end: '*',
      start: '**',
      triggers: ['*'],
    });
  });

  it('keeps explicit start, end, and trigger arrays', () => {
    expect(
      getMatchRange({
        match: { end: '</>', start: '<>' },
        trigger: ['>', '/'],
      })
    ).toEqual({
      end: '</>',
      start: '<>',
      triggers: ['>', '/'],
    });
  });
});
