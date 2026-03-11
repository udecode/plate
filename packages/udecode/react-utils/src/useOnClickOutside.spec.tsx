import React from 'react';

import { fireEvent, render } from '@testing-library/react';

import { DEFAULT_IGNORE_CLASS, useOnClickOutside } from './useOnClickOutside';

const renderUseOnClickOutside = ({
  disabled,
  eventTypes,
  excludeScrollbar,
  ignoreClass,
  outsideClassName,
  useExplicitRefs,
}: {
  disabled?: boolean;
  eventTypes?: string[];
  excludeScrollbar?: boolean;
  ignoreClass?: string[] | string;
  outsideClassName?: string;
  useExplicitRefs?: boolean;
} = {}) => {
  let callCount = 0;
  const callback = () => {
    callCount += 1;
  };

  const Harness = () => {
    const explicitRef = React.useRef<HTMLDivElement>(null);
    const ref = useOnClickOutside(callback, {
      disabled,
      eventTypes,
      excludeScrollbar,
      ignoreClass,
      refs: useExplicitRefs ? [explicitRef] : undefined,
    });

    return (
      <div>
        <div data-testid="inside" ref={useExplicitRefs ? explicitRef : ref} />
        <div className={outsideClassName} data-testid="outside" />
      </div>
    );
  };

  const view = render(<Harness />);

  return {
    getCallCount: () => callCount,
    inside: view.getByTestId('inside'),
    outside: view.getByTestId('outside'),
  };
};

describe('useOnClickOutside', () => {
  it('triggers on outside clicks', () => {
    const { getCallCount, outside } = renderUseOnClickOutside();

    fireEvent.mouseDown(outside);

    expect(getCallCount()).toBe(1);
  });

  it('does not trigger on inside clicks', () => {
    const { getCallCount, inside } = renderUseOnClickOutside();

    fireEvent.mouseDown(inside);

    expect(getCallCount()).toBe(0);
  });

  it('ignores clicks on elements with the ignore class', () => {
    const { getCallCount, outside } = renderUseOnClickOutside({
      ignoreClass: DEFAULT_IGNORE_CLASS,
      outsideClassName: DEFAULT_IGNORE_CLASS,
    });

    fireEvent.mouseDown(outside);

    expect(getCallCount()).toBe(0);
  });

  it('does not register listeners when disabled', () => {
    const { getCallCount, outside } = renderUseOnClickOutside({
      disabled: true,
    });

    fireEvent.mouseDown(outside);

    expect(getCallCount()).toBe(0);
  });

  it('uses custom eventTypes when provided', () => {
    const { getCallCount, outside } = renderUseOnClickOutside({
      eventTypes: ['mouseup'],
    });

    fireEvent.mouseDown(outside);
    fireEvent.mouseUp(outside);

    expect(getCallCount()).toBe(1);
  });

  it('ignores scrollbar clicks when excludeScrollbar is enabled', () => {
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 100,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      configurable: true,
      value: 100,
    });

    const { getCallCount } = renderUseOnClickOutside({
      excludeScrollbar: true,
    });

    document.dispatchEvent(
      new MouseEvent('mousedown', {
        bubbles: true,
        clientX: 101,
        clientY: 10,
      })
    );

    expect(getCallCount()).toBe(0);
  });

  it('supports explicit refs', () => {
    const { getCallCount, inside, outside } = renderUseOnClickOutside({
      useExplicitRefs: true,
    });

    fireEvent.mouseDown(inside);
    fireEvent.mouseDown(outside);

    expect(getCallCount()).toBe(1);
  });
});
