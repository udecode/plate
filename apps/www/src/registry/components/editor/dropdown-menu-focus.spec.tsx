import { afterAll, afterEach, describe, expect, it, mock } from 'bun:test';

import { cleanup, fireEvent, render } from '@testing-library/react';
import * as React from 'react';

let closeMenu: (() => void) | undefined;

const passthrough = ({ children }: React.PropsWithChildren) => <>{children}</>;
const Item = ({
  children,
  closeOnClick = true,
  onClick,
  onSelect,
}: React.PropsWithChildren<{
  closeOnClick?: boolean;
  onClick?: (event: unknown) => void;
  onSelect?: (event: Event) => void;
}>) => (
  <button
    onClick={() => {
      let providerPrevented = false;
      const clickEvent = {
        defaultPrevented: false,
        preventBaseUIHandler: () => {
          providerPrevented = true;
        },
        preventDefault() {
          this.defaultPrevented = true;
        },
      };
      const selectEvent = new Event('select', { cancelable: true });

      onClick?.(clickEvent);
      onSelect?.(selectEvent);

      if (
        closeOnClick &&
        !providerPrevented &&
        !clickEvent.defaultPrevented &&
        !selectEvent.defaultPrevented
      ) {
        closeMenu?.();
      }
    }}
    type="button"
  >
    {children}
  </button>
);

mock.module('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: passthrough,
  DropdownMenuCheckboxItem: Item,
  DropdownMenuContent: ({
    children,
    finalFocus,
    onCloseAutoFocus,
  }: React.PropsWithChildren<{
    finalFocus?: () => boolean;
    onCloseAutoFocus?: (event: Event) => void;
  }>) => {
    closeMenu = () => {
      if (finalFocus) {
        finalFocus();
      } else {
        onCloseAutoFocus?.(new Event('closeAutoFocus', { cancelable: true }));
      }
    };

    return <div>{children}</div>;
  },
  DropdownMenuGroup: passthrough,
  DropdownMenuItem: Item,
  DropdownMenuLabel: passthrough,
  DropdownMenuPortal: passthrough,
  DropdownMenuRadioGroup: passthrough,
  DropdownMenuRadioItem: Item,
  DropdownMenuSeparator: passthrough,
  DropdownMenuShortcut: passthrough,
  DropdownMenuSub: passthrough,
  DropdownMenuSubContent: passthrough,
  DropdownMenuSubTrigger: passthrough,
  DropdownMenuTrigger: passthrough,
}));

afterEach(() => {
  closeMenu = undefined;
  cleanup();
});

afterAll(() => mock.restore());

for (const provider of ['base', 'radix'] as const) {
  describe(`${provider} dropdown final focus`, () => {
    const loadAdapter = () =>
      import(
        `../../bases/${provider}/dropdown-menu?test=${Math.random().toString(36).slice(2)}`
      );

    it('runs the selected item focus intent instead of the content fallback', async () => {
      const menu = await loadAdapter();
      const calls: string[] = [];
      const itemFocus = mock(() => {
        calls.push('focus');
      });
      const fallback = mock(() => undefined);
      const view = render(
        <menu.DropdownMenuContent onFinalFocus={fallback}>
          <menu.DropdownMenuItem
            finalFocus={itemFocus}
            onSelect={() => calls.push('select')}
          >
            Select
          </menu.DropdownMenuItem>
        </menu.DropdownMenuContent>
      );

      fireEvent.click(view.getByRole('button', { name: 'Select' }));

      expect(itemFocus).toHaveBeenCalledTimes(1);
      expect(fallback).not.toHaveBeenCalled();
      expect(calls).toEqual(['select', 'focus']);
    });

    it('preserves the content fallback without item focus intent', async () => {
      const menu = await loadAdapter();
      const fallback = mock(() => undefined);
      const view = render(
        <menu.DropdownMenuContent onFinalFocus={fallback}>
          <menu.DropdownMenuItem>Select</menu.DropdownMenuItem>
        </menu.DropdownMenuContent>
      );

      fireEvent.click(view.getByRole('button', { name: 'Select' }));

      expect(fallback).toHaveBeenCalledTimes(1);
    });

    it('suppresses final focus when the selected item opts out', async () => {
      const menu = await loadAdapter();
      const fallback = mock(() => undefined);
      const view = render(
        <menu.DropdownMenuContent onFinalFocus={fallback}>
          <menu.DropdownMenuItem finalFocus={false}>
            Select
          </menu.DropdownMenuItem>
        </menu.DropdownMenuContent>
      );

      fireEvent.click(view.getByRole('button', { name: 'Select' }));

      expect(fallback).not.toHaveBeenCalled();
    });

    it('does not arm item focus when selection is cancelled', async () => {
      const menu = await loadAdapter();
      const itemFocus = mock(() => undefined);
      const fallback = mock(() => undefined);
      const view = render(
        <menu.DropdownMenuContent onFinalFocus={fallback}>
          <menu.DropdownMenuItem
            finalFocus={itemFocus}
            onSelect={(event: Event) => event.preventDefault()}
          >
            Select
          </menu.DropdownMenuItem>
        </menu.DropdownMenuContent>
      );

      fireEvent.click(view.getByRole('button', { name: 'Select' }));
      closeMenu?.();

      expect(itemFocus).not.toHaveBeenCalled();
      expect(fallback).toHaveBeenCalledTimes(1);
    });

    it('applies the same item focus contract to checkbox and radio items', async () => {
      const menu = await loadAdapter();

      for (const Component of [
        menu.DropdownMenuCheckboxItem,
        menu.DropdownMenuRadioItem,
      ]) {
        const itemFocus = mock(() => undefined);
        const fallback = mock(() => undefined);
        const view = render(
          <menu.DropdownMenuContent onFinalFocus={fallback}>
            {React.createElement(
              Component as React.ComponentType<{
                children: React.ReactNode;
                finalFocus: () => void;
                value: string;
              }>,
              { finalFocus: itemFocus, value: 'value' },
              'Select'
            )}
          </menu.DropdownMenuContent>
        );

        fireEvent.click(view.getByRole('button', { name: 'Select' }));

        expect(itemFocus).toHaveBeenCalledTimes(1);
        expect(fallback).not.toHaveBeenCalled();
        view.unmount();
      }
    });
  });
}
