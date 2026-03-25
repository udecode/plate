import { commandScore } from './command-score';

describe('commandScore', () => {
  it('prefers exact-case and complete matches', () => {
    expect(commandScore('HTML', 'HM')).toBeGreaterThan(
      commandScore('haml', 'HM')
    );
    expect(commandScore('html', 'html')).toBeGreaterThan(
      commandScore('html5', 'html')
    );
  });

  it('rewards word jumps and penalizes transpositions', () => {
    expect(commandScore('foo bar', 'fb')).toBeGreaterThan(
      commandScore('fzzb', 'fb')
    );
    expect(commandScore('ab', 'ba')).toBeGreaterThan(0);
    expect(commandScore('ab', 'ba')).toBeLessThan(commandScore('ab', 'ab'));
  });
});
