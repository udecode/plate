'use client';

import { Toolbar as ToolbarPrimitive } from '@base-ui/react/toolbar';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from 'cn';
import { ChevronDown } from 'lucide-react';
import { useComposedRef } from 'platejs/react';
import * as React from 'react';

import { toggleVariants } from '@/registry/bases/base/ui/toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/registry/bases/base/ui/tooltip';
import {
  ToolbarOverlayProvider,
  useToolbarOverlayTrigger,
} from '@/registry/components/editor/toolbar-overlay';

export function Toolbar({
  className,
  onOverlayOpenChange,
  ref,
  ...props
}: ToolbarPrimitive.Root.Props & {
  onOverlayOpenChange?: (open: boolean) => void;
  ref?: React.Ref<HTMLDivElement>;
}) {
  const [element, setElement] = React.useState<HTMLDivElement | null>(null);
  const rootRef = useComposedRef(ref, setElement);

  return (
    <ToolbarOverlayProvider
      element={element}
      onOpenChange={onOverlayOpenChange}
    >
      <ToolbarPrimitive.Root
        ref={rootRef}
        className={cn('relative flex select-none items-center', className)}
        {...props}
      />
    </ToolbarOverlayProvider>
  );
}

const dropdownArrowVariants = cva(
  'min-w-0 rounded-s-none px-0 text-foreground',
  {
    variants: {
      size: {
        default: 'w-6',
        lg: 'w-8',
        sm: 'w-4',
      },
    },
  }
);

export function ToolbarButton({
  children,
  className,
  isDropdown,
  onKeyDown,
  onMouseDown,
  onPointerCancel,
  onPointerDown,
  pressed,
  size = 'sm',
  tooltip,
  tooltipContentProps,
  tooltipProps,
  tooltipTriggerProps,
  variant,
  ...props
}: {
  isDropdown?: boolean;
  pressed?: boolean;
  tooltip?: React.ReactNode;
  tooltipContentProps?: Omit<
    React.ComponentProps<typeof TooltipContent>,
    'children'
  >;
  tooltipProps?: Omit<React.ComponentProps<typeof Tooltip>, 'children'>;
  tooltipTriggerProps?: Omit<
    React.ComponentProps<typeof TooltipTrigger>,
    'render' | 'children'
  >;
} & Omit<ToolbarPrimitive.Button.Props, 'render'> &
  VariantProps<typeof toggleVariants>) {
  const overlayTrigger = useToolbarOverlayTrigger(props);

  const button = (
    <ToolbarPrimitive.Button
      className={cn(
        toggleVariants({ size, variant }),
        'cursor-pointer',
        isDropdown && 'justify-between gap-1 pe-1',
        className
      )}
      aria-label={typeof tooltip === 'string' ? tooltip : undefined}
      aria-pressed={pressed}
      data-state={pressed === undefined ? undefined : pressed ? 'on' : 'off'}
      {...props}
      onKeyDown={(event) => {
        if (
          !props.disabled &&
          ['Enter', ' ', 'ArrowDown'].includes(event.key)
        ) {
          overlayTrigger.opening();
        }

        onKeyDown?.(event);
      }}
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
      onPointerCancel={(event) => {
        overlayTrigger.cancelled();
        onPointerCancel?.(event);
      }}
      onPointerDown={(event) => {
        if (!props.disabled && event.button === 0 && !event.ctrlKey) {
          overlayTrigger.opening();
        }

        onPointerDown?.(event);
      }}
    >
      {isDropdown ? (
        <>
          <div className="flex flex-1 items-center gap-2 whitespace-nowrap">
            {children}
          </div>
          <ChevronDown className="size-3.5 text-muted-foreground" data-icon />
        </>
      ) : (
        children
      )}
    </ToolbarPrimitive.Button>
  );

  if (!tooltip) return button;

  return (
    <Tooltip {...tooltipProps}>
      <TooltipTrigger render={button} {...tooltipTriggerProps} />
      <TooltipContent {...tooltipContentProps}>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function ToolbarSplitButton({
  className,
  pressed,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { pressed?: boolean }) {
  return (
    <div
      className={cn('group flex gap-0 px-0 hover:bg-transparent', className)}
      data-pressed={pressed || undefined}
      role="group"
      {...props}
    />
  );
}

export function ToolbarSplitButtonPrimary({
  children,
  className,
  onKeyDown,
  onMouseDown,
  onPointerCancel,
  onPointerDown,
  size = 'sm',
  variant,
  ...props
}: Omit<
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Button>,
  'size'
> &
  VariantProps<typeof toggleVariants>) {
  const overlayTrigger = useToolbarOverlayTrigger(props);

  return (
    <ToolbarPrimitive.Button
      className={cn(
        toggleVariants({ size, variant }),
        'cursor-pointer rounded-e-none',
        'group-data-[pressed=true]:bg-accent group-data-[pressed=true]:text-accent-foreground',
        className
      )}
      type="button"
      {...props}
      onKeyDown={(event) => {
        if (
          !props.disabled &&
          ['Enter', ' ', 'ArrowDown'].includes(event.key)
        ) {
          overlayTrigger.opening();
        }

        onKeyDown?.(event);
      }}
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
      onPointerCancel={(event) => {
        overlayTrigger.cancelled();
        onPointerCancel?.(event);
      }}
      onPointerDown={(event) => {
        if (!props.disabled && event.button === 0 && !event.ctrlKey) {
          overlayTrigger.opening();
        }

        onPointerDown?.(event);
      }}
    >
      {children}
    </ToolbarPrimitive.Button>
  );
}

export function ToolbarSplitButtonSecondary({
  className,
  onKeyDown,
  onMouseDown,
  onPointerCancel,
  onPointerDown,
  size = 'sm',
  variant,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Button> &
  VariantProps<typeof toggleVariants>) {
  const overlayTrigger = useToolbarOverlayTrigger(props);

  return (
    <ToolbarPrimitive.Button
      className={cn(
        toggleVariants({ size, variant }),
        dropdownArrowVariants({ size }),
        variant === 'outline' && 'border-s-0',
        'group-data-[pressed=true]:bg-accent group-data-[pressed=true]:text-accent-foreground',
        className
      )}
      type="button"
      {...props}
      onKeyDown={(event) => {
        if (
          !props.disabled &&
          ['Enter', ' ', 'ArrowDown'].includes(event.key)
        ) {
          overlayTrigger.opening();
        }

        onKeyDown?.(event);
      }}
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
      onPointerCancel={(event) => {
        overlayTrigger.cancelled();
        onPointerCancel?.(event);
      }}
      onPointerDown={(event) => {
        if (!props.disabled && event.button === 0 && !event.ctrlKey) {
          overlayTrigger.opening();
        }

        onPointerDown?.(event);
      }}
    >
      <ChevronDown className="size-3.5 text-muted-foreground" data-icon />
    </ToolbarPrimitive.Button>
  );
}

export function ToolbarGroup({
  children,
  className,
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'group/toolbar-group',
        'relative hidden has-[button]:flex',
        className
      )}
    >
      <div className="flex items-center">{children}</div>

      <div
        className="mx-1.5 h-6 w-px bg-border group-last/toolbar-group:hidden!"
        aria-hidden="true"
      />
    </div>
  );
}

export function ToolbarMenuGroup({
  children,
  className,
  label,
  ...props
}: React.ComponentProps<'div'> & { label?: string }) {
  return (
    <>
      <hr
        className={cn(
          'hidden',
          'mb-0 shrink-0 peer-has-[[role=gridcell]]/menu-group:block peer-has-[[role=menuitem]]/menu-group:block peer-has-[[role=menuitemcheckbox]]/menu-group:block peer-has-[[role=menuitemradio]]/menu-group:block peer-has-[[role=option]]/menu-group:block'
        )}
      />

      <div
        role="group"
        {...props}
        className={cn(
          'hidden',
          'peer/menu-group group/menu-group my-1.5 has-[[role=gridcell]]:block has-[[role=menuitem]]:block has-[[role=menuitemcheckbox]]:block has-[[role=menuitemradio]]:block has-[[role=option]]:block',
          className
        )}
      >
        {label && (
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground select-none">
            {label}
          </div>
        )}
        {children}
      </div>
    </>
  );
}
