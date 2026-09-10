import { describe, expect, it, spyOn } from 'bun:test';

import { fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { Command } from './select-command';

describe('Command', () => {
  it('releases queued height measurements when the list unmounts', () => {
    const frames = new Map<number, FrameRequestCallback>();
    let frameId = 0;
    let resized: ResizeObserverCallback | undefined;
    const OriginalObserver = globalThis.ResizeObserver;
    const request = spyOn(
      globalThis,
      'requestAnimationFrame'
    ).mockImplementation((callback) => {
      frameId += 1;
      frames.set(frameId, callback);
      return frameId;
    });
    const cancel = spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(
      (id) => {
        frames.delete(id);
      }
    );
    globalThis.ResizeObserver = class extends OriginalObserver {
      constructor(callback: ResizeObserverCallback) {
        super(callback);
        resized = callback;
      }
    };

    const view = render(
      <Command>
        <Command.List />
      </Command>
    );

    try {
      resized?.([], {} as ResizeObserver);
      resized?.([], {} as ResizeObserver);
      view.unmount();
      expect(frames.size).toBe(0);
    } finally {
      view.unmount();
      globalThis.ResizeObserver = OriginalObserver;
      request.mockRestore();
      cancel.mockRestore();
    }
  });

  for (const [name, Surface] of [
    ['root', Command],
    ['list', Command.List],
    ['group', Command.Group],
  ] as const) {
    it(`preserves custom ${name} child lifetime when its component changes`, () => {
      let activeChildren = 0;
      const childRef = React.createRef<HTMLDivElement>();
      function Stateful({
        children,
        ...props
      }: React.ComponentPropsWithRef<'div'>) {
        const [label] = React.useState('stateful');
        React.useEffect(() => {
          activeChildren += 1;
          return () => {
            activeChildren -= 1;
          };
        }, []);
        return (
          <div {...props} data-child={label}>
            {children}
          </div>
        );
      }
      function Plain({
        children,
        ...props
      }: React.ComponentPropsWithRef<'div'>) {
        return (
          <div {...props} data-child="plain">
            {children}
          </div>
        );
      }
      const scene = (Child: typeof Plain) =>
        name === 'root' ? (
          <Command asChild>
            <Child ref={childRef} />
          </Command>
        ) : (
          <Command>
            <Surface asChild>
              <Child ref={childRef} />
            </Surface>
          </Command>
        );
      const view = render(scene(Stateful));

      expect(activeChildren).toBe(1);
      expect(childRef.current?.getAttribute('data-child')).toBe('stateful');
      view.rerender(scene(Plain));

      expect(
        view.container.querySelector('[data-child="plain"]')
      ).not.toBeNull();
      expect(activeChildren).toBe(0);
      expect(childRef.current?.getAttribute('data-child')).toBe('plain');
      view.unmount();
      expect(childRef.current).toBeNull();
    });
  }

  it('releases every caller ref binding when a list unmounts', () => {
    let activeBindings = 0;
    const view = render(
      <Command>
        <Command.List
          ref={(node) => {
            if (!node) return undefined;
            activeBindings += 1;
            return () => {
              activeBindings -= 1;
            };
          }}
        />
      </Command>
    );

    expect(activeBindings).toBeGreaterThan(0);
    view.unmount();

    expect(activeBindings).toBe(0);
  });

  it('selects the latest inferred item value after its label changes', async () => {
    const Menu = ({ itemLabel }: { itemLabel: string }) => (
      <Command>
        <Command.List>
          <Command.Item>{itemLabel}</Command.Item>
        </Command.List>
      </Command>
    );
    const view = render(<Menu itemLabel="Alpha" />);

    await waitFor(() => {
      expect(
        view.getByRole('option', { name: 'Alpha' }).getAttribute('data-value')
      ).toBe('Alpha');
    });

    view.rerender(<Menu itemLabel="Beta" />);

    const beta = view.getByRole('option', { name: 'Beta' });

    await waitFor(() => {
      expect(beta.getAttribute('data-value')).toBe('Beta');
    });

    fireEvent.click(beta);

    await waitFor(() => {
      expect(beta.getAttribute('aria-selected')).toBe('true');
    });
  });
});
