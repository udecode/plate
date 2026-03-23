import { shouldTrigger } from './shouldTrigger';

describe('shouldTrigger', () => {
  it('matches any later trigger in the list', () => {
    const event = new MouseEvent('mousedown', {
      button: 0,
      shiftKey: true,
    });

    expect(shouldTrigger(event, [2, { button: 0, modifiers: ['shift'] }])).toBe(
      true
    );
  });

  it('treats meta as ctrl for modifier matching', () => {
    const event = new MouseEvent('mousedown', {
      button: 0,
      metaKey: true,
    });

    expect(shouldTrigger(event, [{ button: 0, modifiers: ['ctrl'] }])).toBe(
      true
    );
  });

  it('returns false when no trigger matches', () => {
    const event = new MouseEvent('mousedown', {
      button: 1,
    });

    expect(shouldTrigger(event, [0, { button: 2, modifiers: ['alt'] }])).toBe(
      false
    );
  });
});
