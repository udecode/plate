import { EventTarget } from './EventEmitter';

type TestEvents = {
  change: (value: number) => boolean | void;
};

describe('EventTarget', () => {
  it('calls all listeners and returns false if any listener returns false', () => {
    const target = new EventTarget<TestEvents>();
    const calls: number[] = [];

    target.on('change', (value) => {
      calls.push(value);
    });
    target.on('change', () => false);
    target.on('change', (value) => {
      calls.push(value * 2);
    });

    expect(target.emit('change', 2)).toBe(false);
    expect(calls).toEqual([2, 4]);
  });

  it('supports removing listeners and clearing them all', () => {
    const target = new EventTarget<TestEvents>();
    const listenerCalls: number[] = [];
    const secondListenerCalls: number[] = [];
    const listener: TestEvents['change'] = (value) => {
      listenerCalls.push(value);
    };
    const secondListener: TestEvents['change'] = (value) => {
      secondListenerCalls.push(value);
    };

    target.on('change', listener);
    target.off('change', listener);
    target.emit('change', 1);

    expect(listenerCalls).toEqual([]);

    target.on('change', secondListener);
    target.unbindAllListeners();
    target.emit('change', 2);

    expect(secondListenerCalls).toEqual([]);
  });
});
