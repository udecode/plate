import { afterEach, describe, expect, it, mock } from 'bun:test';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TooltipProvider } from '@/components/ui/tooltip';

import {
  Toolbar,
  ToolbarButton,
  ToolbarSplitButtonPrimary,
  ToolbarSplitButtonSecondary,
} from './toolbar';

afterEach(cleanup);

describe('editor toolbar button focus ownership', () => {
  it('preserves editor focus across plain and split mouse controls', () => {
    const plainMouseDown = mock();
    const primaryMouseDown = mock();
    const secondaryMouseDown = mock();
    const plainClick = mock();
    const primaryClick = mock();
    const secondaryClick = mock();
    const view = render(
      <Toolbar>
        <ToolbarButton onClick={plainClick} onMouseDown={plainMouseDown}>
          Plain
        </ToolbarButton>
        <ToolbarSplitButtonPrimary
          onClick={primaryClick}
          onMouseDown={primaryMouseDown}
        >
          Primary
        </ToolbarSplitButtonPrimary>
        <ToolbarSplitButtonSecondary
          aria-label="Secondary"
          onClick={secondaryClick}
          onMouseDown={secondaryMouseDown}
        />
      </Toolbar>
    );
    const controls = [
      {
        click: plainClick,
        mouseDown: plainMouseDown,
        node: view.getByRole('button', { name: 'Plain' }),
      },
      {
        click: primaryClick,
        mouseDown: primaryMouseDown,
        node: view.getByRole('button', { name: 'Primary' }),
      },
      {
        click: secondaryClick,
        mouseDown: secondaryMouseDown,
        node: view.getByRole('button', { name: 'Secondary' }),
      },
    ];

    controls.forEach(({ click, mouseDown, node }) => {
      expect(fireEvent.mouseDown(node)).toBe(false);
      expect(mouseDown).toHaveBeenCalledTimes(1);
      expect(mouseDown.mock.calls[0]?.[0].defaultPrevented).toBe(true);

      fireEvent.click(node);

      expect(click).toHaveBeenCalledTimes(1);
    });
  });

  it('does not cancel keyboard events', () => {
    const onKeyDown = mock();
    const view = render(
      <Toolbar>
        <ToolbarButton onKeyDown={onKeyDown}>Keyboard</ToolbarButton>
      </Toolbar>
    );
    const button = view.getByRole('button', { name: 'Keyboard' });

    act(() => button.focus());

    expect(fireEvent.keyDown(button, { key: 'Enter' })).toBe(true);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onKeyDown.mock.calls[0]?.[0].defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(button);
  });

  it('composes tooltip and dropdown trigger pointer behavior', () => {
    function DropdownToolbarButton() {
      const [open, setOpen] = React.useState(false);

      return (
        <TooltipProvider>
          <Toolbar>
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <ToolbarButton tooltip="Choose a block" isDropdown>
                  Text
                </ToolbarButton>
              </DropdownMenuTrigger>
            </DropdownMenu>
          </Toolbar>
        </TooltipProvider>
      );
    }

    const view = render(<DropdownToolbarButton />);
    const trigger = view.getByRole('button', { name: 'Text' });

    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    act(() => {
      fireEvent.pointerDown(trigger, {
        button: 0,
        ctrlKey: false,
        pointerType: 'mouse',
      });
    });

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('reports an icon-only dropdown from its ARIA trigger contract', () => {
    const onOverlayOpenChange = mock();

    function IconDropdown() {
      const [open, setOpen] = React.useState(false);

      return (
        <TooltipProvider>
          <Toolbar onOverlayOpenChange={onOverlayOpenChange}>
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <ToolbarButton tooltip="More actions">More</ToolbarButton>
              </DropdownMenuTrigger>
            </DropdownMenu>
          </Toolbar>
        </TooltipProvider>
      );
    }

    const view = render(<IconDropdown />);
    const trigger = view.getByRole('button', { name: 'More' });

    act(() => {
      fireEvent.pointerDown(trigger, {
        button: 0,
        ctrlKey: false,
        pointerType: 'mouse',
      });
    });

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(onOverlayOpenChange).toHaveBeenLastCalledWith(true);

    act(() => {
      fireEvent.pointerDown(trigger, {
        button: 0,
        ctrlKey: false,
        pointerType: 'mouse',
      });
    });

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(onOverlayOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('reports a split-button dropdown from its ARIA trigger contract', () => {
    const onOverlayOpenChange = mock();

    function SplitDropdown() {
      const [open, setOpen] = React.useState(false);

      return (
        <Toolbar onOverlayOpenChange={onOverlayOpenChange}>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <ToolbarSplitButtonSecondary aria-label="More list styles" />
            </DropdownMenuTrigger>
          </DropdownMenu>
        </Toolbar>
      );
    }

    const view = render(<SplitDropdown />);
    const trigger = view.getByRole('button', { name: 'More list styles' });

    act(() => {
      fireEvent.pointerDown(trigger, {
        button: 0,
        ctrlKey: false,
        pointerType: 'mouse',
      });
    });

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(onOverlayOpenChange).toHaveBeenLastCalledWith(true);
  });
});
