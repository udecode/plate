import React from 'react';

import { render } from '@testing-library/react';

import { createPrimitiveComponent } from './createPrimitiveComponent';

describe('createPrimitiveComponent', () => {
  it('composes state and props hooks, merges props, and applies setProps', () => {
    const hookRefCalls: (HTMLButtonElement | null)[] = [];
    const stateHookCalls: Array<{ active?: boolean } | undefined> = [];
    const propsHookCalls: Array<{ active: boolean }> = [];
    const hookRef = (node: HTMLButtonElement | null) => {
      hookRefCalls.push(node);
    };
    const stateHook = ({ active = false }: { active?: boolean } = {}) => {
      stateHookCalls.push({ active });

      return { active };
    };
    const propsHook = (state: { active: boolean }) => {
      propsHookCalls.push(state);

      return {
        props: {
          className: 'from-hook',
          style: { color: 'red', padding: '1px' },
          'data-active': String(state.active),
          type: 'button' as const,
        },
        ref: hookRef,
      };
    };
    const Button = createPrimitiveComponent('button')({ propsHook, stateHook });

    const { getByRole } = render(
      <Button
        className="from-prop"
        options={{ active: true }}
        setProps={(hookProps) =>
          ({
            'data-hook-class': String(
              String(hookProps.className).includes('from-hook')
            ),
          }) as any
        }
        style={{ color: 'blue', margin: '2px' }}
      >
        Click
      </Button>
    );

    const button = getByRole('button', { name: 'Click' }) as HTMLButtonElement;

    expect(stateHookCalls).toEqual([{ active: true }]);
    expect(propsHookCalls).toEqual([{ active: true }]);
    expect(button.classList.contains('from-hook')).toBe(true);
    expect(button.classList.contains('from-prop')).toBe(true);
    expect(button.style.color).toBe('blue');
    expect(button.style.margin).toBe('2px');
    expect(button.style.padding).toBe('1px');
    expect(button.getAttribute('data-active')).toBe('true');
    expect(button.getAttribute('data-hook-class')).toBe('true');
    expect(hookRefCalls).toContain(button);
  });

  it('bypasses stateHook when an explicit state prop is provided', () => {
    const stateHookCalls: unknown[] = [];
    const propsHookCalls: Array<{ active: boolean }> = [];
    const stateHook = () => {
      stateHookCalls.push('called');

      return { active: true };
    };
    const propsHook = (state: { active: boolean }) => {
      propsHookCalls.push(state);

      return {
        props: { 'data-active': String(state.active) },
      };
    };
    const Button = createPrimitiveComponent('button')({ propsHook, stateHook });

    const { getByRole } = render(
      <Button state={{ active: false }}>Click</Button>
    );

    expect(stateHookCalls).toEqual([]);
    expect(propsHookCalls).toEqual([{ active: false }]);
    expect(
      getByRole('button', { name: 'Click' }).getAttribute('data-active')
    ).toBe('false');
  });

  it('returns null when propsHook hides the component', () => {
    const HiddenDiv = createPrimitiveComponent('div')({
      propsHook: () => ({ hidden: true, props: {} }),
    });

    const { container } = render(<HiddenDiv data-testid="hidden" />);

    expect(container.firstChild).toBeNull();
  });

  it('forwards refs to both the hook ref and the external ref', () => {
    const hookRef = React.createRef<HTMLButtonElement>();
    const externalRef = React.createRef<HTMLButtonElement>();
    const Button = createPrimitiveComponent('button')({
      propsHook: () => ({ props: { type: 'button' as const }, ref: hookRef }),
    });

    const { getByRole } = render(<Button ref={externalRef}>Click</Button>);

    const button = getByRole('button', { name: 'Click' }) as HTMLButtonElement;

    expect(hookRef.current).toBe(button);
    expect(externalRef.current).toBe(button);
  });
});
