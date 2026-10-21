import { afterAll, afterEach, describe, expect, it, mock } from 'bun:test';

import {
  cleanup,
  createEvent,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { ToolbarOverlayProvider } from './toolbar-overlay';

type ChangeDetails = {
  cancel?: () => void;
  event?: Event;
  isCanceled?: boolean;
  reason: string;
};

let changeOpen: ((open: boolean, details: ChangeDetails) => void) | undefined;
let closeMenu: (() => boolean) | undefined;
let escapeKeyDown: ((event: KeyboardEvent) => void) | undefined;
let interactOutside:
  | ((event: CustomEvent<{ originalEvent: Event }>) => void)
  | undefined;
let parentRefusesClose = false;

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
        changeOpen?.(false, { reason: 'item-press' });
        if (!parentRefusesClose) closeMenu?.();
      }
    }}
    type="button"
  >
    {children}
  </button>
);

mock.module('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({
    children,
    onOpenChange,
  }: React.PropsWithChildren<{
    onOpenChange?: (open: boolean, details: ChangeDetails) => void;
  }>) => {
    changeOpen = onOpenChange;

    return <>{children}</>;
  },
  DropdownMenuCheckboxItem: Item,
  DropdownMenuContent: ({
    children,
    finalFocus,
    onBlurCapture,
    onCloseAutoFocus,
    onEscapeKeyDown,
    onFocusCapture,
    onInteractOutside,
    ref,
  }: React.PropsWithChildren<{
    finalFocus?: () => boolean;
    onBlurCapture?: React.FocusEventHandler<HTMLDivElement>;
    onCloseAutoFocus?: (event: Event) => void;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onFocusCapture?: React.FocusEventHandler<HTMLDivElement>;
    onInteractOutside?: (event: CustomEvent<{ originalEvent: Event }>) => void;
    ref?: React.Ref<HTMLDivElement>;
  }>) => {
    escapeKeyDown = onEscapeKeyDown;
    interactOutside = onInteractOutside;
    closeMenu = () => {
      if (finalFocus) return finalFocus();

      const event = new Event('closeAutoFocus', { cancelable: true });
      onCloseAutoFocus?.(event);

      return !event.defaultPrevented;
    };

    return (
      <div
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
  changeOpen = undefined;
  closeMenu = undefined;
  escapeKeyDown = undefined;
  interactOutside = undefined;
  parentRefusesClose = false;
  cleanup();
});

afterAll(() => mock.restore());

const runCloseTimers = () =>
  React.act(
    () =>
      new Promise<void>((resolve) => {
        setTimeout(() => setTimeout(resolve, 0), 0);
      })
  );

for (const provider of ['base', 'radix'] as const) {
  describe(`${provider} dropdown final focus`, () => {
    const loadAdapter = () =>
      import(
        `../../bases/${provider}/dropdown-menu?test=${Math.random()
          .toString(36)
          .slice(2)}`
      );

    const reportOutside = (event: Event, reason: string) => {
      if (provider === 'base') {
        changeOpen?.(false, { event, reason });
      } else {
        interactOutside?.(
          new CustomEvent('interactoutside', {
            detail: { originalEvent: event },
          })
        );
      }
    };
    const pressEscape = () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });

      if (provider === 'base') {
        changeOpen?.(false, { event, reason: 'escape-key' });
      } else {
        escapeKeyDown?.(event);
      }
    };

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
          <div role="menu">
            <button type="button">Other menu</button>
          </div>
          <button type="button">Outside</button>
        </>
      );
      const view = render(ui(), { container });
      const button = (name: string) => view.getByRole('button', { name });
      const trigger = button('Open');

      return {
        fallback,
        item: button('Select'),
        nested: screen.getByRole('button', { name: 'Nested' }),
        otherMenu: button('Other menu'),
        outside: button('Outside'),
        press: (target: Element, init?: MouseEventInit) => {
          const event = createEvent.pointerDown(target, init);

          document.addEventListener(
            'pointerdown',
            () =>
              reportOutside(
                event,
                target === trigger ? 'trigger-press' : 'outside-press'
              ),
            { capture: true, once: true }
          );
          fireEvent(target, event);
        },
        setOpen: (next: boolean) => view.rerender(ui(next)),
        sibling: button('Bold'),
        trigger,
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

    it('holds its toolbar open until the close focus timer after its popup unmounts', async () => {
      const menu = await loadAdapter();
      const overlayOpen = mock((_open: boolean) => undefined);
      const ui = (open: boolean) => (
        <ToolbarOverlayProvider onOpenChange={overlayOpen}>
          <menu.DropdownMenu open={open}>
            {open && <menu.DropdownMenuContent>Item</menu.DropdownMenuContent>}
          </menu.DropdownMenu>
        </ToolbarOverlayProvider>
      );
      const view = render(ui(true));

      view.rerender(ui(false));
      expect(overlayOpen.mock.calls.at(-1)).toEqual([true]);

      await runCloseTimers();
      expect(overlayOpen.mock.calls.at(-1)).toEqual([false]);
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
      const { fallback, press, trigger } = await renderMenu({ modal: false });

      press(trigger);
      closeMenu?.();

      expect(fallback).toHaveBeenCalledTimes(1);
    });

    it("runs the content fallback when another button in the trigger's toolbar closes the menu", async () => {
      const { fallback, press, sibling } = await renderMenu({ modal: false });

      press(sibling);
      closeMenu?.();

      expect(fallback).toHaveBeenCalledTimes(1);
    });

    it('leaves focus on a sibling toolbar control that took it before the close', async () => {
      const { fallback, press, sibling } = await renderMenu({ modal: false });

      press(sibling);
      sibling.focus();

      expect(closeMenu?.()).toBe(false);
      expect(fallback).not.toHaveBeenCalled();
    });

    it('leaves focus where an outside press on a non-modal menu puts it', async () => {
      const { fallback, press } = await renderMenu({ modal: false });

      press(document.body);

      expect(closeMenu?.()).toBe(false);
      expect(fallback).not.toHaveBeenCalled();
    });

    it('leaves focus after a press in another open menu', async () => {
      const { fallback, otherMenu, press } = await renderMenu({
        modal: false,
      });

      press(otherMenu);

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
      const { fallback, press } = await renderMenu({});

      press(document.body, { button: 0 });
      closeMenu?.();

      expect(fallback).toHaveBeenCalledTimes(1);
    });

    it('leaves focus after a secondary press outside a modal menu', async () => {
      const { fallback, press } = await renderMenu({});

      press(document.body, { button: 2 });

      expect(closeMenu?.()).toBe(false);
      expect(fallback).not.toHaveBeenCalled();
    });

    it("leaves focus after a secondary press on another button in the trigger's toolbar", async () => {
      const { fallback, press, sibling } = await renderMenu({ modal: false });

      press(sibling, { button: 2 });

      expect(closeMenu?.()).toBe(false);
      expect(fallback).not.toHaveBeenCalled();
    });

    it('leaves focus where a focus move out of the menu puts it', async () => {
      const { fallback, outside } = await renderMenu({});

      outside.focus();
      reportOutside(new FocusEvent('focusout'), 'focus-out');

      expect(closeMenu?.()).toBe(false);
      expect(fallback).not.toHaveBeenCalled();
    });

    it('runs the content fallback on Escape after the parent refused an outside close', async () => {
      const { fallback, press } = await renderMenu({ modal: false });

      press(document.body);
      pressEscape();
      closeMenu?.();

      expect(fallback).toHaveBeenCalledTimes(1);
    });

    it('drops an item focus intent whose close the parent refused', async () => {
      const itemFocus = mock(() => undefined);
      const { fallback, item, press } = await renderMenu({
        itemFocus,
        modal: false,
      });

      parentRefusesClose = true;
      fireEvent.click(item);
      parentRefusesClose = false;
      press(document.body);

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
      const { fallback, press, sibling } = await renderMenu({
        container,
        modal: false,
      });

      press(sibling);
      closeMenu?.();
      host.remove();

      expect(fallback).toHaveBeenCalledTimes(1);
    });

    it("drops a closing item's focus intent once its parent reopens the menu before it unmounts", async () => {
      const intent = mock(() => undefined);
      const { fallback, item, setOpen } = await renderMenu({
        itemFocus: intent,
        open: true,
      });

      parentRefusesClose = true;
      fireEvent.click(item);
      setOpen(false);
      setOpen(true);
      setOpen(false);
      closeMenu?.();

      expect(intent).not.toHaveBeenCalled();
      expect(fallback).toHaveBeenCalledTimes(1);
    });

    it('leaves focus after an outside press while the closed menu waits to unmount', async () => {
      const { fallback, setOpen } = await renderMenu({
        modal: false,
        open: true,
      });

      setOpen(false);
      fireEvent.pointerDown(document.body);

      expect(closeMenu?.()).toBe(false);
      expect(fallback).not.toHaveBeenCalled();
    });

    it("runs a closing item's focus intent after an outside press while the closed menu waits to unmount", async () => {
      const intent = mock(() => undefined);
      const { fallback, item, setOpen } = await renderMenu({
        itemFocus: intent,
        modal: false,
        open: true,
      });

      parentRefusesClose = true;
      fireEvent.click(item);
      setOpen(false);
      fireEvent.pointerDown(document.body);
      closeMenu?.();

      expect(intent).toHaveBeenCalledTimes(1);
      expect(fallback).not.toHaveBeenCalled();
    });

    it('runs the content fallback after a press on its own toolbar while the closed menu waits to unmount', async () => {
      const { fallback, setOpen, sibling } = await renderMenu({
        modal: false,
        open: true,
      });

      setOpen(false);
      fireEvent.pointerDown(sibling);
      closeMenu?.();

      expect(fallback).toHaveBeenCalledTimes(1);
    });

    it('keeps its toolbar held for a reopened menu when the earlier popup releases late', async () => {
      const menu = await loadAdapter();
      const overlayOpen = mock((_open: boolean) => undefined);
      const ui = (open: boolean) => (
        <ToolbarOverlayProvider onOpenChange={overlayOpen}>
          <menu.DropdownMenu open={open}>
            {open && <menu.DropdownMenuContent>Item</menu.DropdownMenuContent>}
          </menu.DropdownMenu>
        </ToolbarOverlayProvider>
      );
      const view = render(ui(true));

      view.rerender(ui(false));
      view.rerender(ui(true));
      await runCloseTimers();
      view.rerender(ui(false));
      expect(overlayOpen.mock.calls.at(-1)).toEqual([true]);

      await runCloseTimers();
      expect(overlayOpen.mock.calls.at(-1)).toEqual([false]);
    });

    if (provider === 'radix') {
      it('runs the content fallback after Radix refused a focus move out of the menu', async () => {
        const { fallback } = await renderMenu({});
        const event = new CustomEvent('interactoutside', {
          cancelable: true,
          detail: { originalEvent: new FocusEvent('focusin') },
        });

        event.preventDefault();
        interactOutside?.(event);
        closeMenu?.();

        expect(fallback).toHaveBeenCalledTimes(1);
      });
    }

    if (provider === 'base') {
      it('leaves focus after a ctrl press on its own trigger closes the menu', async () => {
        const { fallback, press, trigger } = await renderMenu({
          modal: false,
        });

        press(trigger, { button: 0, ctrlKey: true });

        expect(closeMenu?.()).toBe(false);
        expect(fallback).not.toHaveBeenCalled();
      });

      it('holds no toolbar overlay for an opening its parent cancels', async () => {
        const menu = await loadAdapter();
        const overlayOpen = mock((_open: boolean) => undefined);

        render(
          <ToolbarOverlayProvider onOpenChange={overlayOpen}>
            <menu.DropdownMenu
              onOpenChange={(_open: boolean, details: ChangeDetails) =>
                details.cancel?.()
              }
            >
              <menu.DropdownMenuTrigger>
                <button type="button">Open</button>
              </menu.DropdownMenuTrigger>
            </menu.DropdownMenu>
          </ToolbarOverlayProvider>
        );
        React.act(() => {
          const details: ChangeDetails = {
            cancel() {
              details.isCanceled = true;
            },
            isCanceled: false,
            reason: 'trigger-press',
          };

          changeOpen?.(true, details);
        });

        expect(overlayOpen).not.toHaveBeenCalled();
      });

      it('runs the content fallback when the menu closes with focus in its submenu', async () => {
        const { fallback, nested } = await renderMenu({ modal: false });

        nested.focus();
        fireEvent.keyDown(nested, { key: 'Enter' });

        expect(closeMenu?.()).toBe(true);
        expect(fallback).toHaveBeenCalledTimes(1);
      });

      it('leaves focus on the trigger when Shift+Tab moves it there', async () => {
        const { fallback, trigger } = await renderMenu({});

        trigger.focus();
        reportOutside(
          new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }),
          'focus-out'
        );

        expect(closeMenu?.()).toBe(false);
        expect(fallback).not.toHaveBeenCalled();
      });

      it("drops a closing item's focus intent once the menu reopens itself before it unmounts", async () => {
        const intent = mock(() => undefined);
        const { fallback, item } = await renderMenu({ itemFocus: intent });

        parentRefusesClose = true;
        fireEvent.click(item);
        changeOpen?.(true, { reason: 'trigger-press' });
        changeOpen?.(false, { reason: 'trigger-press' });
        closeMenu?.();

        expect(intent).not.toHaveBeenCalled();
        expect(fallback).toHaveBeenCalledTimes(1);
      });
    }
  });
}
