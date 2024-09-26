/* eslint-disable tailwindcss/no-custom-classname,react/button-has-type,jsx-a11y/no-noninteractive-tabindex */
import React, {
  type DependencyList,
  type JSXElementConstructor,
  type ReactElement,
  type ReactNode,
  type RefCallback,
  useCallback,
  useState,
} from 'react';

import {
  createEvent,
  fireEvent,
  render,
  renderHook,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type {
  FormTags,
  HotkeyCallback,
  Keys,
  Options,
} from '../internal/types';

import { HotkeysProvider, Key, useHotkeys } from '..';

const wrapper =
  (
    initialScopes: string[]
  ): JSXElementConstructor<{ children: ReactElement }> =>
  // eslint-disable-next-line react/display-name
  ({ children }: { children?: ReactNode }) => (
    <HotkeysProvider initiallyActiveScopes={initialScopes}>
      {children}
    </HotkeysProvider>
  );

type HookParameters = {
  keys: Keys;
  callback?: HotkeyCallback;
  dependencies?: DependencyList;
  options?: Options;
};

beforeEach(() => {
  window.dispatchEvent(new Event('DOMContentLoaded'));
});

it('should listen to esc modifier for escape key', async () => {
  const user = userEvent.setup();

  const callback = jest.fn();

  renderHook(() => useHotkeys('esc', callback));

  await user.keyboard('{Escape}');

  expect(callback).toHaveBeenCalledTimes(1);
});

it('should work without a wrapped context provider when not using scopes', async () => {
  const user = userEvent.setup();

  const callback = jest.fn();

  renderHook(() => useHotkeys('a', callback));

  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);
});

it('should log a warning when trying to set a scope without a wrapped provider', async () => {
  console.warn = jest.fn();
  const callback = jest.fn();

  renderHook(() => useHotkeys('a', callback, { scopes: 'foo' }));

  expect(console.warn).toHaveBeenCalledWith(
    'A hotkey has the "scopes" option set, however no active scopes were found. If you want to use the global scopes feature, you need to wrap your app in a <HotkeysProvider>'
  );
  expect(callback).not.toHaveBeenCalled();
});

it('should call hotkey when scopes are set but activatedScopes includes wildcard scope', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  const render = (initialScopes: string[] = []) =>
    renderHook<void, HookParameters>(
      ({ keys, options }) => useHotkeys(keys, callback, options),
      {
        initialProps: {
          keys: 'a',
          options: { scopes: 'foo' },
        },
        wrapper: wrapper(initialScopes) as any,
      }
    );

  render();

  await user.keyboard('A');

  expect(callback).toHaveBeenCalled();
});

it('should not call hotkey when scopes are set but activatedScopes does not include set scope', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  const render = (initialScopes: string[] = []) =>
    renderHook<void, HookParameters>(
      ({ keys, options }) => useHotkeys(keys, callback, options),
      {
        initialProps: {
          keys: 'a',
          options: { scopes: 'foo' },
        },
        wrapper: wrapper(initialScopes) as any,
      }
    );

  render(['bar']);

  await user.keyboard('A');

  expect(callback).not.toHaveBeenCalled();
});

it('should call hotkey when scopes are set and activatedScopes does include some set scopes', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  const render = (initialScopes: string[] = []) =>
    renderHook<void, HookParameters>(
      ({ keys, options }) => useHotkeys(keys, callback, options),
      {
        initialProps: {
          keys: 'a',
          options: { scopes: 'foo' },
        },
        wrapper: wrapper(initialScopes) as any,
      }
    );

  render(['foo']);

  await user.keyboard('A');

  expect(callback).toHaveBeenCalled();
});

it('should handle multiple scopes', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  const render = (initialScopes: string[] = []) =>
    renderHook<void, HookParameters>(
      ({ keys, options }) => useHotkeys(keys, callback, options),
      {
        initialProps: {
          keys: 'a',
          options: { scopes: ['foo', 'bar'] },
        },
        wrapper: wrapper(initialScopes) as any,
      }
    );

  render(['baz', 'bar']);

  await user.keyboard('A');

  expect(callback).toHaveBeenCalled();
});

it('should update call behavior when set scopes change', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  const render = (initialScopes: string[] = []) =>
    renderHook<void, HookParameters>(
      ({ keys, options }) => useHotkeys(keys, callback, options),
      {
        initialProps: {
          keys: 'a',
          options: { scopes: 'foo' },
        },
        wrapper: wrapper(initialScopes) as any,
      }
    );

  const { rerender } = render(['foo']);

  await user.keyboard('A');

  expect(callback).toHaveBeenCalled();

  rerender({ keys: 'a', options: { scopes: 'bar' } });

  await userEvent.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);
});

it('scope should take precedence over enabled flag/function', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  const render = (initialScopes: string[] = []) =>
    renderHook<void, HookParameters>(
      ({ keys, options }) => useHotkeys(keys, callback, options),
      {
        initialProps: {
          keys: 'a',
          options: { enabled: true, scopes: 'bar' },
        },
        wrapper: wrapper(initialScopes) as any,
      }
    );

  const { rerender } = render(['foo']);

  await user.keyboard('A');

  expect(callback).not.toHaveBeenCalled();

  rerender({ keys: 'a', options: { enabled: true, scopes: 'foo' } });

  await user.keyboard('A');

  expect(callback).toHaveBeenCalled();
});

it('should listen to key presses', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('a', callback));

  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);
});

it('should ignore unregistered key events', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('a', callback));

  await user.keyboard('B');

  expect(callback).not.toHaveBeenCalled();
});

it('should listen to multiple hotkeys', async () => {
  const user = userEvent.setup();

  const callback = jest.fn();

  renderHook(() => useHotkeys(['a', 'b'], callback));

  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);

  await user.keyboard('B');

  expect(callback).toHaveBeenCalledTimes(2);

  await user.keyboard('C');

  expect(callback).toHaveBeenCalledTimes(2);
});

it('should be able to always output correct keys on multiple hotkeys', async () => {
  const user = userEvent.setup();

  const callbackA = jest.fn();
  const callbackB = jest.fn();

  renderHook(() => useHotkeys(['a'], callbackA));
  renderHook(() => useHotkeys(['b'], callbackB));

  await user.keyboard('{A>}');

  expect(callbackA).toHaveBeenCalledTimes(1);

  await user.keyboard('B');
  expect(callbackA).toHaveBeenCalledTimes(1);
  expect(callbackB).toHaveBeenCalledTimes(1);

  await user.keyboard('C');

  expect(callbackA).toHaveBeenCalledTimes(1);
  expect(callbackB).toHaveBeenCalledTimes(1);

  await user.keyboard('B');
  expect(callbackA).toHaveBeenCalledTimes(1);
  expect(callbackB).toHaveBeenCalledTimes(2);

  await user.keyboard('{/A}');
  expect(callbackA).toHaveBeenCalledTimes(1);
  expect(callbackB).toHaveBeenCalledTimes(2);
});

it('should be able to parse first argument as string, array or readonly array', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  const { rerender } = renderHook<void, HookParameters>(
    ({ keys }) => useHotkeys(keys, callback),
    {
      initialProps: {
        keys: 'a, b',
      },
    }
  );

  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);

  rerender({ keys: ['a', 'b'] });

  await user.keyboard('B');

  expect(callback).toHaveBeenCalledTimes(2);

  rerender({ keys: ['a', 'c'] as const });

  await user.keyboard('C');

  expect(callback).toHaveBeenCalledTimes(3);
});

it('should listen to combinations with modifiers', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  const { rerender } = renderHook<void, HookParameters>(
    ({ keys }) => useHotkeys(keys, callback),
    {
      initialProps: {
        keys: 'meta+a',
      },
    }
  );

  await user.keyboard('{Meta>}A{/Meta}');

  expect(callback).toHaveBeenCalledTimes(1);

  rerender({ keys: 'meta+shift+a' });

  await user.keyboard('{Meta}A{/Meta}');
  await user.keyboard('{Meta>}{Shift>}A{/Shift}{/Meta}');

  expect(callback).toHaveBeenCalledTimes(2);

  rerender({ keys: 'meta+shift+alt+a' });

  await user.keyboard('{Meta>}{Alt>}{Shift>}A{/Shift}{/Alt}{/Meta}');

  expect(callback).toHaveBeenCalledTimes(3);
});

it('should not trigger when combinations are incomplete', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys(['meta+a'], callback));

  await user.keyboard('{Meta}');

  expect(callback).not.toHaveBeenCalled();
});

it('should trigger on combinations without modifiers', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('a+b+c', callback));

  await user.keyboard('{A>}{B>}C{/B}{/A}');

  expect(callback).toHaveBeenCalledTimes(1);

  await user.keyboard('{A>}B{/A}');

  expect(callback).toHaveBeenCalledTimes(1);
});

it('should listen to multiple combinations with modifiers', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  const { rerender } = renderHook(() =>
    useHotkeys('meta+shift+a, alt+b', callback)
  );

  await user.keyboard('{Meta>}{Shift>}A{/Shift}{/Meta}');

  expect(callback).toHaveBeenCalledTimes(1);

  rerender(() => useHotkeys('meta+shift+alt+a', callback));

  await user.keyboard('{Alt>}B{/Alt}');

  expect(callback).toHaveBeenCalledTimes(2);
});

it('should reflect set delimiter character', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  const { rerender } = renderHook<RefCallback<HTMLElement>, HookParameters>(
    ({ keys, options }) => useHotkeys(keys, callback, options),
    {
      initialProps: { keys: 'a, b', options: undefined },
    }
  );

  await user.keyboard('A');
  await user.keyboard('B');

  expect(callback).toHaveBeenCalledTimes(2);

  rerender({ keys: 'f. shift+g', options: { delimiter: '.' } });

  await user.keyboard('F');
  await user.keyboard('{Shift>}G{/Shift}');

  expect(callback).toHaveBeenCalledTimes(4);
});

it('should listen to + if the splitKey is set to something different then +', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('+', callback, { splitKey: '-', useKey: true }));

  await user.keyboard('+');

  expect(callback).toHaveBeenCalledTimes(1);
});

it('should default to keydown if neither keyup nor keydown is passed', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('shift', callback));

  await user.keyboard('{Shift>}');

  expect(callback).toHaveBeenCalledTimes(1);
});

it('should not listen to keyup if keydown is passed', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('shift', callback, { keydown: true }));

  await user.keyboard('{Shift>}');

  expect(callback).toHaveBeenCalledTimes(1);

  await user.keyboard('{/Shift}');

  expect(callback).toHaveBeenCalledTimes(1);
});

it('should not listen to keydown if keyup is passed', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('a', callback, { keyup: true }));

  await user.keyboard('{A>}');

  expect(callback).toHaveBeenCalledTimes(0);

  await user.keyboard('{/A}');

  expect(callback).toHaveBeenCalledTimes(1);
});

it('should trigger on named keys when keyup is set to true', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('shift', callback, { keyup: true }));

  await user.keyboard('{Shift>}');

  expect(callback).toHaveBeenCalledTimes(0);

  await user.keyboard('{/Shift}');

  expect(callback).toHaveBeenCalledTimes(1);
});

it('should trigger twice if keyup and keydown are passed', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('A', callback, { keydown: true, keyup: true }));

  await user.keyboard('{A}');

  expect(callback).toHaveBeenCalledTimes(2);
});

it('should be disabled on form tags by default', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();
  const Component = ({ cb }: { cb: HotkeyCallback }) => {
    useHotkeys<HTMLDivElement>('a', cb);

    return <input data-testid="form-tag" type="text" />;
  };

  const { getByTestId } = render(<Component cb={callback} />);

  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);

  await user.click(getByTestId('form-tag'));
  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);
  expect(getByTestId('form-tag')).toHaveValue('A');
});

it('should be enabled on given form tags', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();
  const Component = ({
    cb,
    enableOnFormTags,
  }: {
    cb: HotkeyCallback;
    enableOnFormTags?: readonly FormTags[];
  }) => {
    useHotkeys<HTMLDivElement>('a', cb, { enableOnFormTags });

    return <input data-testid="form-tag" type="text" />;
  };

  const { getByTestId } = render(
    <Component cb={callback} enableOnFormTags={['INPUT']} />
  );

  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);

  await user.click(getByTestId('form-tag'));
  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(2);
  expect(getByTestId('form-tag')).toHaveValue('A');
});

it('should ignore case of form tags', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();
  const Component = ({
    cb,
    enableOnFormTags,
  }: {
    cb: HotkeyCallback;
    enableOnFormTags?: FormTags[];
  }) => {
    useHotkeys<HTMLDivElement>('a', cb, { enableOnFormTags });

    return <input data-testid="form-tag" type="text" />;
  };

  const { getByTestId } = render(
    <Component cb={callback} enableOnFormTags={['input']} />
  );

  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);

  await user.click(getByTestId('form-tag'));
  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(2);
  expect(getByTestId('form-tag')).toHaveValue('A');
});

it("should ignore event when ignoreEventWhen's condition matches", async () => {
  const user = userEvent.setup();
  const callback = jest.fn();
  const Component = ({
    cb,
    ignoreEventWhen,
  }: {
    cb: HotkeyCallback;
    ignoreEventWhen?: (e: KeyboardEvent) => boolean;
  }) => {
    useHotkeys<HTMLDivElement>('a', cb, { ignoreEventWhen });

    return <button data-testid="test-button" className="ignore" />;
  };

  const eventCondition = (e: KeyboardEvent) => {
    const element = e.target as HTMLElement;

    return element.className === 'ignore';
  };

  const { getByTestId } = render(
    <Component cb={callback} ignoreEventWhen={eventCondition} />
  );

  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);

  await user.click(getByTestId('test-button'));
  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);
});

it("shouldn't ignore event when ignoreEventWhen's condition doesn't match", async () => {
  const user = userEvent.setup();
  const callback = jest.fn();
  const Component = ({
    cb,
    ignoreEventWhen,
  }: {
    cb: HotkeyCallback;
    ignoreEventWhen?: (e: KeyboardEvent) => boolean;
  }) => {
    useHotkeys<HTMLDivElement>('a', cb, { ignoreEventWhen });

    return <button data-testid="test-button" className="dont-ignore" />;
  };

  const eventCondition = (e: KeyboardEvent) => {
    const element = e.target as HTMLElement;

    return element.className === 'ignore';
  };

  const { getByTestId } = render(
    <Component cb={callback} ignoreEventWhen={eventCondition} />
  );

  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);

  await user.click(getByTestId('test-button'));
  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(2);
});

it('should call ignoreEventWhen callback only when event is a hotkey match', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();
  const Component = ({
    cb,
    ignoreEventWhen,
  }: {
    cb: HotkeyCallback;
    ignoreEventWhen?: (e: KeyboardEvent) => boolean;
  }) => {
    useHotkeys<HTMLDivElement>('a', cb, { ignoreEventWhen });

    return <button data-testid="test-button" className="ignore" />;
  };

  const { getByTestId } = render(
    <Component cb={jest.fn()} ignoreEventWhen={callback} />
  );

  await user.keyboard('X');

  expect(callback).not.toHaveBeenCalled();

  await user.click(getByTestId('test-button'));
  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);
});

it('enabledOnTags should accept boolean', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();
  const Component = ({
    cb,
    enableOnFormTags,
  }: {
    cb: HotkeyCallback;
    enableOnFormTags?: FormTags[] | boolean;
  }) => {
    useHotkeys<HTMLDivElement>('a', cb, { enableOnFormTags });

    return <input data-testid="form-tag" type="text" />;
  };

  const { getByTestId } = render(<Component cb={callback} enableOnFormTags />);

  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);

  await user.click(getByTestId('form-tag'));
  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(2);
  expect(getByTestId('form-tag')).toHaveValue('A');
});

it('should prevent pressed down key propagate to input field when preventDefault is set to true and form tag is enabled', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();
  const Component = ({
    cb,
    enableOnFormTags,
  }: {
    cb: HotkeyCallback;
    enableOnFormTags?: FormTags[];
  }) => {
    useHotkeys<HTMLDivElement>('a', cb, {
      enableOnFormTags,
      preventDefault: true,
    });

    return <input data-testid="form-tag" type="text" />;
  };

  const { getByTestId } = render(
    <Component cb={callback} enableOnFormTags={['INPUT']} />
  );

  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);

  await user.click(getByTestId('form-tag'));
  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(2);
  expect(getByTestId('form-tag')).toHaveValue('');
});

it('should be disabled on all other tags by default', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();
  const Component = ({
    cb,
    enableOnFormTags,
  }: {
    cb: HotkeyCallback;
    enableOnFormTags?: FormTags[];
  }) => {
    useHotkeys<HTMLDivElement>('a', cb, { enableOnFormTags });

    return (
      <>
        <input data-testid="form-tag" type="text" />
        <textarea />
      </>
    );
  };

  const { getByTestId } = render(
    <Component cb={callback} enableOnFormTags={['TEXTAREA']} />
  );

  await user.click(getByTestId('form-tag'));
  await user.keyboard('A');

  expect(callback).not.toHaveBeenCalled();
  expect(getByTestId('form-tag')).toHaveValue('A');
});

it('should not bind the event if enabled is set to false', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('a', callback, { enabled: false }));

  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(0);
});

it('should bind the event and trigger if enabled is set to true', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('a', callback, { enabled: true }));

  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);
});

it('should bind the event and execute the callback if enabled is set to a function and returns true', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  const { rerender } = renderHook<void, HookParameters>(
    ({ keys, options }) => useHotkeys(keys, callback, options),
    {
      initialProps: {
        keys: 'a',
        options: {
          enabled: () => true,
        },
      },
    }
  );

  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);

  rerender({
    keys: 'a',
    options: {
      enabled: () => false,
    },
  });

  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);

  rerender({
    keys: 'a',
    options: {
      enabled: () => true,
    },
  });

  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(2);
});

it('should return a ref', async () => {
  const callback = jest.fn();

  const { result } = renderHook(() => useHotkeys('a', callback));

  expect(result.current).toBeDefined();
});

it('should only trigger when the element is focused if a ref is set', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  const Component = ({ cb }: { cb: HotkeyCallback }) => {
    const ref = useHotkeys<HTMLDivElement>('a', cb);

    return (
      <div data-testid="div" ref={ref} tabIndex={0}>
        <input type="text" />
      </div>
    );
  };

  const { getByTestId } = render(<Component cb={callback} />);

  await user.keyboard('A');

  expect(callback).not.toHaveBeenCalled();

  await user.click(getByTestId('div'));
  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);
});

it('should trigger when the ref is re-attached to another element', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  const Component = ({ cb }: { cb: HotkeyCallback }) => {
    const ref = useHotkeys<HTMLDivElement>('a', cb);
    const [toggle, setToggle] = useState(false);

    if (toggle) {
      return (
        <span data-testid="div" ref={ref} tabIndex={0}>
          <button data-testid="toggle" onClick={() => setToggle((t) => !t)}>
            Toggle
          </button>
          <input type="text" />
        </span>
      );
    }

    return (
      <div data-testid="div" ref={ref} tabIndex={0}>
        <button data-testid="toggle" onClick={() => setToggle((t) => !t)}>
          Toggle
        </button>
        <input type="text" />
      </div>
    );
  };

  const { getByTestId } = render(<Component cb={callback} />);

  await user.keyboard('A');

  expect(callback).not.toHaveBeenCalled();

  await user.click(getByTestId('toggle'));
  await user.click(getByTestId('div'));
  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);
});

// it.skip('should preventDefault and stop propagation when ref is not focused', async () => {
//   const callback = jest.fn();
//
//   const Component = ({ cb }: { cb: HotkeyCallback }) => {
//     const ref = useHotkeys<HTMLDivElement>('a', cb);
//
//     return (
//       <div data-testid="div" tabIndex={-1}>
//         <div data-testid="ref" ref={ref} tabIndex={-1}>
//           <span>Example text</span>
//         </div>
//       </div>
//     );
//   };
//
//   render(<Component cb={jest.fn()} />);
//
//   await userEvent.click(screen.getByTestId('div'));
//
//   await userEvent.keyboard('A');
//
//   expect(callback).not.toHaveBeenCalled();
//
//   await userEvent.click(screen.getByTestId('ref'));
//
//   await userEvent.keyboard('A');
//
//   expect(callback).toHaveBeenCalled();
// });

it('should allow * as a wildcard', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('*', callback));

  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);
});

it('should listen to function keys f1-f16', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('f1, f16', callback));

  await user.keyboard('[F1]');
  await user.keyboard('[F16]');

  expect(callback).toHaveBeenCalledTimes(2);
});

it.each([
  'arrowUp',
  'arrowDown',
  'arrowLeft',
  'arrowRight',
  'space',
  'enter',
  'backspace',
])('should allow named key %s', async (key) => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys(key, callback));

  await user.keyboard(key === 'space' ? '[Space]' : `{${key}}`);

  expect(callback).toHaveBeenCalledTimes(1);
});

// it.skip('should trigger when used in portals', async () => {});

it('should parse options and dependencies correctly no matter their position', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('a', callback, [true], { enabled: true }));

  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);

  renderHook(() => useHotkeys('b', callback, { enabled: true }, [true]));

  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(2);

  renderHook(() => useHotkeys('c', callback, [true], { enabled: false }));

  await user.keyboard('C');

  renderHook(() => useHotkeys('d', callback, { enabled: false }, [true]));

  await user.keyboard('D');

  expect(callback).toHaveBeenCalledTimes(2);
});

it('should pass keyboard event and hotkey object to callback', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('a', callback));

  await user.keyboard('A');

  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    keys: ['a'],
    alt: false,
    ctrl: false,
    meta: false,
    mod: false,
    shift: false,
    useKey: false,
  });
});

it('should set shift to true in hotkey object if listening to shift', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('shift+a', callback));

  await user.keyboard('{Shift>}A{/Shift}');

  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    keys: ['a'],
    alt: false,
    ctrl: false,
    meta: false,
    mod: false,
    shift: true,
    useKey: false,
  });
});

it('should set ctrl to true in hotkey object if listening to ctrl', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('ctrl+a', callback));

  await user.keyboard('{Control>}A{/Control}');

  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    keys: ['a'],
    alt: false,
    ctrl: true,
    meta: false,
    mod: false,
    shift: false,
    useKey: false,
  });
});

it('should set alt to true in hotkey object if listening to alt', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('alt+a', callback));

  await user.keyboard('{Alt>}A{/Alt}');

  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    keys: ['a'],
    alt: true,
    ctrl: false,
    meta: false,
    mod: false,
    shift: false,
    useKey: false,
  });
});

it('should set mod to true in hotkey object if listening to mod', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('mod+a', callback));

  await user.keyboard('{Meta>}A{/Meta}');

  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    keys: ['a'],
    alt: false,
    ctrl: false,
    meta: false,
    mod: true,
    shift: false,
    useKey: false,
  });
});

it('should set meta to true in hotkey object if listening to meta', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('meta+a', callback));

  await user.keyboard('{Meta>}A{/Meta}');

  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    keys: ['a'],
    alt: false,
    ctrl: false,
    meta: true,
    mod: false,
    shift: false,
    useKey: false,
  });
});

it('should set multiple modifiers to true in hotkey object if listening to multiple modifiers', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('mod+shift+a', callback));

  await user.keyboard('{Meta>}{Shift>}A{/Shift}{/Meta}');

  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    keys: ['a'],
    alt: false,
    ctrl: false,
    meta: false,
    mod: true,
    shift: true,
    useKey: false,
  });
});

it('should stop propagation when enabled function resolves to false', async () => {
  const callback = jest.fn();

  renderHook(() => useHotkeys('a', callback, { enabled: () => false }));

  const keyDownEvent = createEvent.keyDown(document, {
    key: 'A',
    code: 'KeyA',
  });

  fireEvent(document, keyDownEvent);

  expect(keyDownEvent.defaultPrevented).toBe(true);
});

it('should reflect preventDefault option when set', async () => {
  const callback = jest.fn();

  renderHook(() => useHotkeys('a', callback, { preventDefault: true }));

  const keyDownEvent = createEvent.keyDown(document, {
    key: 'A',
    code: 'KeyA',
  });

  fireEvent(document, keyDownEvent);

  expect(callback).toHaveBeenCalledTimes(1);
  expect(keyDownEvent.defaultPrevented).toBe(true);
});

it('should not prevent default behavior when preventDefault option is not set', async () => {
  const callback = jest.fn();

  renderHook(() => useHotkeys('a', callback));

  const keyDownEvent = createEvent.keyDown(document, {
    key: 'A',
    code: 'KeyA',
  });

  fireEvent(document, keyDownEvent);

  expect(callback).toHaveBeenCalledTimes(1);
  expect(keyDownEvent.defaultPrevented).toBe(false);
});

it('should prevent default behavior if preventDefault option is set to a function that returns true', async () => {
  const callback = jest.fn();

  renderHook(() => useHotkeys('a', callback, { preventDefault: () => true }));

  const keyDownEvent = createEvent.keyDown(document, {
    key: 'A',
    code: 'KeyA',
  });

  fireEvent(document, keyDownEvent);

  expect(callback).toHaveBeenCalledTimes(1);
  expect(keyDownEvent.defaultPrevented).toBe(true);
});

it('should not prevent default behavior if preventDefault option is set to a function that returns false', async () => {
  const callback = jest.fn();

  renderHook(() => useHotkeys('a', callback, { preventDefault: () => false }));

  const keyDownEvent = createEvent.keyDown(document, {
    key: 'A',
    code: 'KeyA',
  });

  fireEvent(document, keyDownEvent);

  expect(callback).toHaveBeenCalledTimes(1);
  expect(keyDownEvent.defaultPrevented).toBe(false);
});

it('should call preventDefault option function with hotkey and keyboard event', async () => {
  const user = userEvent.setup();
  const preventDefault = jest.fn();

  renderHook(() => useHotkeys('a', async () => {}, { preventDefault }));

  await user.keyboard('A');

  expect(preventDefault).toHaveBeenCalledTimes(1);
  expect(preventDefault).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    keys: ['a'],
    alt: false,
    ctrl: false,
    meta: false,
    mod: false,
    shift: false,
    useKey: false,
  });
});

it('Should listen to space key', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('space', callback));

  await user.keyboard(' ');

  expect(callback).toHaveBeenCalledTimes(1);
});

it.each([
  ['esc', 'Escape'],
  ['return', 'Enter'],
  ['left', 'ArrowLeft'],
  ['up', 'ArrowUp'],
  ['right', 'ArrowRight'],
  ['down', 'ArrowDown'],
])('Should map key %s to %s', async (hotkey, keyboardKey) => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys(hotkey, callback));

  await user.keyboard(`{${keyboardKey}}`);

  expect(callback).toHaveBeenCalledTimes(1);
});

it.each(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])(
  `Should listen to number key %s`,
  async (key) => {
    const user = userEvent.setup();
    const callback = jest.fn();

    renderHook(() => useHotkeys(`shift+${key}`, callback));

    await user.keyboard(`{Shift>}${key}{/Shift}`);

    expect(callback).toHaveBeenCalledTimes(1);
  }
);

it('should not call callback if meta is held down but other key is not present in combination is pressed', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys(`meta+z`, callback));

  await user.keyboard(`{Meta>}Z`);

  expect(callback).toHaveBeenCalledTimes(1);

  await user.keyboard('Z');

  expect(callback).toHaveBeenCalledTimes(2);

  await user.keyboard('F{/Meta}');

  expect(callback).toHaveBeenCalledTimes(2);
});

it('should listen to keydown permanently', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('A', callback, { keydown: true, keyup: true }));

  await user.keyboard('{A}');
  await user.keyboard('{A}');

  expect(callback).toHaveBeenCalledTimes(4);
});

it('Should test for modifiers by default', async () => {
  const user = userEvent.setup();

  const callback = jest.fn();

  renderHook(() => useHotkeys('shift+d', callback));

  await user.keyboard('{Shift>}d{/Shift}');

  expect(callback).toHaveBeenCalledTimes(1);

  await user.keyboard('d');

  expect(callback).toHaveBeenCalledTimes(1);
});

it('Should ignore modifiers if option is set', async () => {
  const user = userEvent.setup();

  const callback = jest.fn();

  renderHook(() => useHotkeys('d', callback, { ignoreModifiers: true }));

  await user.keyboard('{Shift>}d{/Shift}');

  expect(callback).toHaveBeenCalledTimes(1);

  await user.keyboard('d');

  expect(callback).toHaveBeenCalledTimes(2);
});

it('should respect dependencies array if they are passed', async () => {
  function Fixture() {
    const [count, setCount] = useState(0);

    const incrementCount = useCallback(() => {
      setCount(count + 1);
    }, [count]);

    useHotkeys('esc', incrementCount, []);

    return <div>{count}</div>;
  }

  const user = userEvent.setup();

  const { getByText } = render(<Fixture />);

  expect(getByText('0')).toBeInTheDocument();

  await user.keyboard('{Escape}');
  await user.keyboard('{Escape}');

  expect(getByText('1')).toBeInTheDocument();
});

it('should use updated callback if no dependencies are passed', async () => {
  function Fixture() {
    const [count, setCount] = useState(0);

    const incrementCount = useCallback(() => {
      setCount(count + 1);
    }, [count]);

    useHotkeys('esc', incrementCount);

    return <div>{count}</div>;
  }

  const user = userEvent.setup();

  const { getByText } = render(<Fixture />);

  expect(getByText('0')).toBeInTheDocument();

  await user.keyboard('{Escape}');
  await user.keyboard('{Escape}');

  expect(getByText('2')).toBeInTheDocument();
});

it('Should trigger only callback for combination', async () => {
  const user = userEvent.setup();

  const combinationsCallback = jest.fn();
  const keysCallback = jest.fn();

  const handleHotkey: HotkeyCallback = (_, hotkeysEvent) => {
    const { keys, meta } = hotkeysEvent;

    if (meta && keys && keys[0] === 'z') {
      combinationsCallback();
    } else if (!meta && keys && keys[0] === 'z') {
      keysCallback();
    }
  };

  renderHook(() => useHotkeys([`meta+z`, `z`], handleHotkey));

  await user.keyboard(`{Meta>}Z`);

  expect(combinationsCallback).toHaveBeenCalledTimes(1);
  expect(keysCallback).toHaveBeenCalledTimes(0);
});

it.each(['Shift', 'Alt', 'Meta', 'Ctrl', 'Control'])(
  'Should listen to %s on keyup',
  async (key) => {
    const user = userEvent.setup();
    const callback = jest.fn();

    renderHook(() => useHotkeys(key, callback, { keyup: true }));

    await user.keyboard(`{${key === 'Ctrl' ? 'Control' : key}}`);

    expect(callback).toHaveBeenCalledTimes(1);
  }
);

it('Should listen to produced key and not to code', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys('!', callback));

  await user.keyboard(`{Shift>}{!}{/Shift}`);

  expect(callback).toHaveBeenCalledTimes(0);

  renderHook(() => useHotkeys('shift+1', callback));

  await user.keyboard(`{Shift>}{1}{/Shift}`);

  expect(callback).toHaveBeenCalledTimes(1);
});

it('Should not check produced key if useKey is not set', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys(`=`, callback));

  await user.keyboard(`=`);

  expect(callback).toHaveBeenCalledTimes(0);
});

it('Should check produced key if useKey is true', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys(`=`, callback, { useKey: true }));

  await user.keyboard(`=`);

  expect(callback).toHaveBeenCalledTimes(1);
});

// NEW
it('should handle Key[][] input', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys([[Key.Control, Key.Alt, '0']], callback));

  await user.keyboard('{Control>}{Alt>}0{/Alt}{/Control}');

  expect(callback).toHaveBeenCalledTimes(1);
});

it('should use custom splitKey for Key[][] input', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() =>
    useHotkeys([[Key.Control, Key.Alt, '0']], callback, { splitKey: '-' })
  );

  await user.keyboard('{Control>}{Alt>}0{/Alt}{/Control}');

  expect(callback).toHaveBeenCalledTimes(1);
});

it('should handle multiple key combinations with Key[][]', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() =>
    useHotkeys(
      [
        [Key.Control, 'A'],
        [Key.Alt, 'B'],
      ],
      callback
    )
  );

  await user.keyboard('{Control>}A{/Control}');
  expect(callback).toHaveBeenCalledTimes(1);

  await user.keyboard('{Alt>}B{/Alt}');
  expect(callback).toHaveBeenCalledTimes(2);
});

it('should not trigger for incomplete Key[][] combinations', async () => {
  const user = userEvent.setup();
  const callback = jest.fn();

  renderHook(() => useHotkeys([[Key.Control, Key.Alt, '0']], callback));

  await user.keyboard('{Control>}{Alt>}');
  expect(callback).not.toHaveBeenCalled();

  await user.keyboard('A');
  expect(callback).not.toHaveBeenCalled();
});
