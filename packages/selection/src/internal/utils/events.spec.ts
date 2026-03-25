import { off, on, simplifyEvent } from './events';

describe('events', () => {
  it('normalizes html collections and event arrays when binding listeners', () => {
    const parent = document.createElement('div');
    const first = document.createElement('button');
    const second = document.createElement('button');
    const listener = () => {};
    const firstSpy = spyOn(first, 'addEventListener');
    const secondSpy = spyOn(second, 'addEventListener');

    parent.append(first, second);

    const [items, events] = on(
      parent.children,
      ['mousedown', 'mouseup'],
      listener,
      { passive: true }
    );

    expect(items).toEqual([first, second]);
    expect(events).toEqual(['mousedown', 'mouseup']);
    expect(firstSpy).toHaveBeenCalledWith('mousedown', listener, {
      capture: false,
      passive: true,
    });
    expect(secondSpy).toHaveBeenCalledWith('mouseup', listener, {
      capture: false,
      passive: true,
    });
  });

  it('removes listeners from arrays and simplifies touch or mouse events', () => {
    const first = document.createElement('div');
    const second = document.createElement('div');
    const listener = () => {};
    const firstSpy = spyOn(first, 'removeEventListener');
    const secondSpy = spyOn(second, 'removeEventListener');
    const touchTarget = document.createElement('div');

    off([first, undefined, second], 'click', listener);

    expect(firstSpy).toHaveBeenCalledWith('click', listener, {
      capture: false,
    });
    expect(secondSpy).toHaveBeenCalledWith('click', listener, {
      capture: false,
    });
    expect(
      simplifyEvent({
        touches: [{ clientX: 10, clientY: 20, target: touchTarget }],
      })
    ).toEqual({ target: touchTarget, x: 10, y: 20 });

    const mouseTarget = document.createElement('div');

    expect(
      simplifyEvent({
        clientX: 1,
        clientY: 2,
        target: mouseTarget,
      })
    ).toEqual({ target: mouseTarget, x: 1, y: 2 });
  });
});
