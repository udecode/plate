import { PLUGINS } from './plate-keys';

describe('PLUGINS', () => {
  it('publishes first-party capability names', () => {
    expect(PLUGINS.paragraph).toBe('paragraph');
    expect(PLUGINS.bold).toBe('bold');
  });
});
