import { cn } from './cn';

describe('cn utilities', () => {
  it('merges Tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});
