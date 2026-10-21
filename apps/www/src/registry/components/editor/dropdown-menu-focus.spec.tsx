import { afterAll, afterEach, describe, expect, it, mock } from 'bun:test';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { createPortal } from 'react-dom';

let closeMenu: (() => boolean) | undefined;
let parentRefusesClose = false;
let popupAnimatesOut = false;

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
        !parentRefusesClose &&
        !popupAnimatesOut &&
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
    onBlurCapture,
    onCloseAutoFocus,
    onFocusCapture,
    ref,
  }: React.PropsWithChildren<{
    finalFocus?: () => boolean;
    onBlurCapture?: React.FocusEventHandler<HTMLDivElement>;
    onCloseAutoFocus?: (event: Event) => void;
    onFocusCapture?: React.FocusEventHandler<HTMLDivElement>;
    ref?: React.Ref<HTMLDivElement>;
  }>) => {
    closeMenu = () => {
      if (finalFocus) return finalFocus();

      const event = new Event('closeAutoFocus', { cancelable: true });
      onCloseAutoFocus?.(event);

      return !event.defaultPrevented;
    };

    return (
      <div
        data-open=""
        onBlurCapture={onBlurCapture}
        onFocusCapture={onFocusCapture}
        ref={ref}
        role="menu"
      >
        {children}
      </div>
    );
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
  DropdownMenuSubContent: ({ children }: React.PropsWithChildren) =>
    createPortal(<div role="menu">{children}</div>, document.body),
  DropdownMenuSubTrigger: passthrough,
  DropdownMenuTrigger: ({
    children,
    ref,
    render: element,
  }: React.PropsWithChildren<{
    ref?: React.Ref<HTMLSpanElement>;
    render?: React.ReactNode;
  }>) => <span ref={ref}>{element ?? children}</span>,
}));

afterEach(() => {
  closeMenu = undefined;
  parentRefusesClose = false;
  popupAnimatesOut = false;
  cleanup();
});

afterAll(() => mock.restore());

for (const provider of ['base', 'radix'] as const) {
  describe(`${provider} dropdown final focus`, () => {
    const loadAdapter = () =>
      import(
        `../../bases/${provider}/dropdown-menu?test=${Math.random().toString(36).slice(2)}`
      );

    const renderMenu = async ({
      container,
      itemFocus,
      modal,
      open,
    }: {
      container?: HTMLElement;
      itemFocus?: false | (() => void);
      modal?: boolean;
      open?: boolean;
    }) => {
      const menu = await loadAdapter();
      const fallback = mock(() => undefined);
      const ui = (isOpen = open) => (
        <>
          <div role="toolbar">
            <button type="button">Bold</button>
            <menu.DropdownMenu modal={modal} open={isOpen}>
              <menu.DropdownMenuTrigger>
                <button type="button">Open</button>
              </menu.DropdownMenuTrigger>
              <menu.DropdownMenuContent onFinalFocus={fallback}>
                <menu.DropdownMenuItem finalFocus={itemFocus}>
                  Select
                </menu.DropdownMenuItem>
                <menu.DropdownMenuSub>
                  <menu.DropdownMenuSubContent>
                    <button type="button">Nested</button>
                  </menu.DropdownMenuSubContent>
                </menu.DropdownMenuSub>
              </menu.DropdownMenuContent>
            </menu.DropdownMenu>
          </div>
          <button type="button">Outside</button>
        </>
      );
      const view = render(ui(), { container });
      const button = (name: string) => view.getByRole('button', { name });

      return {
        fallback,
        item: button('Select'),
        menu: view.getAllByRole('menu')[0],
        nested: screen.getByRole('button', { name: 'Nested' }),
        outside: button('Outside'),
        setOpen: (next: boolean) => view.rerender(ui(next)),
        sibling: button('Bold'),
        trigger: button('Open'),
        view,
      };
    };

    it("passes a parent's ref through to the trigger", async () => {
      const menu = await loadAdapter();
      const ref = React.createRef<HTMLButtonElement>();

      render(
        <menu.DropdownMenu>
          <menu.DropdownMenuTrigger ref={ref}>
            <button type="button">Open</button>
          </menu.DropdownMenuTrigger>
        </menu.DropdownMenu>
      );

      expect(ref.current).toBeInstanceOf(HTMLElement);
    });

    it("passes a parent's ref through to the menu content", async () => {
      const menu = await loadAdapter();
      const ref = React.createRef<HTMLDivElement>();

      render(
        <menu.DropdownMenu>
          <menu.DropdownMenuContent ref={ref}>Item</menu.DropdownMenuContent>
        </menu.DropdownMenu>
      );

      expect(ref.current).toBeInstanceOf(HTMLElement);
    });

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
      const { fallback, item } = await renderMenu({ itemFocus: false });

      fireEvent.pointerDown(item);
      fireEvent.click(item);

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
          <menu.DropdownMenu>
            <menu.DropdownMenuContent onFinalFocus={fallback}>
              {React.createElement(
                Component as React.ComponentType<{
                  children?: React.ReactNode;
                  finalFocus: () => void;
                  value: string;
                }>,
                { finalFocus: itemFocus, value: 'value' },
                'Select'
              )}
            </menu.DropdownMenuContent>
          </menu.DropdownMenu>
        );

        fireEvent.click(view.getByRole('button', { name: 'Select' }));

        expect(itemFocus).toHaveBeenCalledTimes(1);
        expect(fallback).not.toHaveBeenCalled();
        view.unmount();
      }
    });

    it('runs the content fallback when its own trigger closes the menu', async () => {
      const { fallback, trigger } = await renderMenu({ modal: false });

      fireEvent.pointerDown(trigger);
      closeMenu?.();

      expect(fallback).toHaveBeenCalledTimes(1);
    });

    it("runs the content fallback when another button in the trigger's toolbar closes the menu", async () => {
      const { fallback, sibling } = await renderMenu({ modal: false });

      fireEvent.pointerDown(sibling);
      closeMenu?.();

      expect(fallback).toHaveBeenCalledTimes(1);
    });

    it('leaves focus on a sibling toolbar control that took it before the close', async () => {
      const { fallback, sibling } = await renderMenu({ modal: false });

      fireEvent.pointerDown(sibling);
      sibling.focus();

      expect(closeMenu?.()).toBe(false);
      expect(fallback).not.toHaveBeenCalled();
    });

    it('leaves focus where an outside press on a non-modal menu puts it', async () => {
      const { fallback } = await renderMenu({ modal: false });

      fireEvent.pointerDown(document.body);

      expect(closeMenu?.()).toBe(false);
      expect(fallback).not.toHaveBeenCalled();
    });

    it('leaves focus when its owner unmounts the menu during an outside press', async () => {
      const { fallback, view } = await renderMenu({ modal: false });

      fireEvent.pointerDown(document.body);
      view.unmount();

      expect(closeMenu?.()).toBe(false);
      expect(fallback).not.toHaveBeenCalled();
    });

    it('leaves focus on an outside control that took it before its owner unmounted the menu', async () => {
      const { fallback, view } = await renderMenu({ modal: false });
      const input = document.body.appendChild(document.createElement('input'));

      input.focus();
      view.unmount();
      const restored = closeMenu?.();
      input.remove();

      expect(restored).toBe(false);
      expect(fallback).not.toHaveBeenCalled();
    });

    it('runs the content fallback after a primary press outside a modal menu', async () => {
      const { fallback } = await renderMenu({});

      fireEvent.pointerDown(document.body, { button: 0 });
      closeMenu?.();

      expect(fallback).toHaveBeenCalledTimes(1);
    });

    it('leaves focus after a secondary press outside a modal menu', async () => {
      const { fallback } = await renderMenu({});

      fireEvent.pointerDown(document.body, { button: 2 });

      expect(closeMenu?.()).toBe(false);
      expect(fallback).not.toHaveBeenCalled();
    });

    it("leaves focus after a secondary press on another button in the trigger's toolbar", async () => {
      const { fallback, sibling } = await renderMenu({ modal: false });

      fireEvent.pointerDown(sibling, { button: 2 });

      expect(closeMenu?.()).toBe(false);
      expect(fallback).not.toHaveBeenCalled();
    });

    it('leaves focus on the trigger when Shift+Tab moves it there', async () => {
      const { fallback, menu, trigger } = await renderMenu({});

      fireEvent.keyDown(menu, { key: 'Tab', shiftKey: true });
      trigger.focus();

      expect(closeMenu?.()).toBe(false);
      expect(fallback).not.toHaveBeenCalled();
    });

    it('leaves focus where a focus move out of the menu puts it', async () => {
      const { fallback, outside } = await renderMenu({});

      outside.focus();

      expect(closeMenu?.()).toBe(false);
      expect(fallback).not.toHaveBeenCalled();
    });

    it('runs the content fallback on Escape after the parent refused an outside close', async () => {
      const { fallback, menu } = await renderMenu({ modal: false });

      fireEvent.pointerDown(document.body);
      fireEvent.keyDown(menu, { key: 'Escape' });
      closeMenu?.();

      expect(fallback).toHaveBeenCalledTimes(1);
    });

    it('runs the content fallback on a submenu Escape after the parent refused an outside close', async () => {
      const { fallback, nested } = await renderMenu({ modal: false });

      fireEvent.pointerDown(document.body);
      fireEvent.keyDown(nested, { key: 'Escape' });
      closeMenu?.();

      expect(fallback).toHaveBeenCalledTimes(1);
    });

    it('drops an item focus intent whose close the parent refused', async () => {
      const itemFocus = mock(() => undefined);
      const { fallback, item } = await renderMenu({ itemFocus, modal: false });

      parentRefusesClose = true;
      fireEvent.pointerDown(item);
      fireEvent.click(item);
      parentRefusesClose = false;
      fireEvent.pointerDown(document.body);

      expect(closeMenu?.()).toBe(false);
      expect(itemFocus).not.toHaveBeenCalled();
      expect(fallback).not.toHaveBeenCalled();
    });

    it('runs the content fallback on a close with no gesture', async () => {
      const { fallback } = await renderMenu({ modal: false });

      closeMenu?.();

      expect(fallback).toHaveBeenCalledTimes(1);
    });

    it('classifies presses inside a shadow root by their composed path', async () => {
      const host = document.body.appendChild(document.createElement('div'));
      const container = host
        .attachShadow({ mode: 'open' })
        .appendChild(document.createElement('div'));
      const { fallback, sibling } = await renderMenu({
        container,
        modal: false,
      });

      fireEvent.pointerDown(sibling);
      closeMenu?.();
      host.remove();

      expect(fallback).toHaveBeenCalledTimes(1);
    });

    if (provider === 'base') {
      it('runs the content fallback when the menu closes with focus in its submenu', async () => {
        const { fallback, nested } = await renderMenu({ modal: false });

        nested.focus();
        fireEvent.keyDown(nested, { key: 'Enter' });

        expect(closeMenu?.()).toBe(true);
        expect(fallback).toHaveBeenCalledTimes(1);
      });

      it("keeps a closing item's focus opt-out through a press during the exit animation", async () => {
        const { fallback, item, menu, trigger } = await renderMenu({
          itemFocus: false,
        });

        popupAnimatesOut = true;
        fireEvent.pointerDown(item);
        fireEvent.click(item);
        menu.removeAttribute('data-open');
        fireEvent.pointerDown(trigger);

        expect(closeMenu?.()).toBe(false);
        expect(fallback).not.toHaveBeenCalled();
      });

      it("drops a closing item's focus intent once its parent reopens the menu during the exit animation", async () => {
        const intent = mock(() => undefined);
        const { fallback, item, menu, setOpen } = await renderMenu({
          itemFocus: intent,
          open: true,
        });

        popupAnimatesOut = true;
        fireEvent.pointerDown(item);
        fireEvent.click(item);
        setOpen(false);
        menu.removeAttribute('data-open');
        setOpen(true);
        setOpen(false);
        closeMenu?.();

        expect(intent).not.toHaveBeenCalled();
        expect(fallback).toHaveBeenCalledTimes(1);
      });
    }
  });
}
