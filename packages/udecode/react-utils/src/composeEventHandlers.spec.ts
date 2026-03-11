import { composeEventHandlers } from './composeEventHandlers';

describe('composeEventHandlers', () => {
  it('calls handlers in order', () => {
    const calls: string[] = [];
    const event = { defaultPrevented: false };

    const handler = composeEventHandlers(
      () => {
        calls.push('original');
      },
      () => {
        calls.push('ours');
      }
    );

    handler(event as any);

    expect(calls).toEqual(['original', 'ours']);
  });

  it('skips the second handler when default is prevented', () => {
    const calls: string[] = [];
    const event = { defaultPrevented: false };

    const handler = composeEventHandlers(
      (nextEvent: typeof event) => {
        nextEvent.defaultPrevented = true;
        calls.push('original');
      },
      () => {
        calls.push('ours');
      }
    );

    handler(event as any);

    expect(calls).toEqual(['original']);
  });

  it('can ignore defaultPrevented checks', () => {
    const calls: string[] = [];
    const event = { defaultPrevented: false };

    const handler = composeEventHandlers(
      (nextEvent: typeof event) => {
        nextEvent.defaultPrevented = true;
        calls.push('original');
      },
      () => {
        calls.push('ours');
      },
      { checkForDefaultPrevented: false }
    );

    handler(event as any);

    expect(calls).toEqual(['original', 'ours']);
  });
});
