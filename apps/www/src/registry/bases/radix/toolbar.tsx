'use client';

import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { type VariantProps, cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

type ToolbarOverlayContextValue = (id: symbol, open: boolean) => void;

const ToolbarOverlayContext = React.createContext<ToolbarOverlayContextValue>(
  () => {}
);

type ToolbarOverlayTriggerProps = Pick<
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Button>,
  'aria-expanded' | 'aria-haspopup'
>;

const isOverlayTrigger = ({
  'aria-haspopup': hasPopup,
}: ToolbarOverlayTriggerProps) => hasPopup !== undefined && hasPopup !== false;

const isOverlayOpen = ({
  'aria-expanded': expanded,
}: ToolbarOverlayTriggerProps) => expanded === true || expanded === 'true';

const useToolbarOverlayTrigger = (props: ToolbarOverlayTriggerProps) => {
  const [overlayId] = React.useState(() => Symbol('toolbar-overlay'));
  const reportOverlayOpen = React.useContext(ToolbarOverlayContext);
  const ownsOverlay = isOverlayTrigger(props);
  const open = isOverlayOpen(props);
  const registeredRef = React.useRef(false);

  React.useEffect(() => {
    if (ownsOverlay) {
      registeredRef.current = true;
      reportOverlayOpen(overlayId, open);
    } else if (registeredRef.current) {
      registeredRef.current = false;
      reportOverlayOpen(overlayId, false);
    }
  }, [open, overlayId, ownsOverlay, reportOverlayOpen]);

  React.useEffect(
    () => () => {
      if (registeredRef.current) reportOverlayOpen(overlayId, false);
    },
    [overlayId, reportOverlayOpen]
  );

  return () => {
    if (ownsOverlay) reportOverlayOpen(overlayId, true);
  };
};

export function Toolbar({
  className,
  onOverlayOpenChange,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Root> & {
  onOverlayOpenChange?: (open: boolean) => void;
}) {
  const openOverlayIdsRef = React.useRef(new Set<symbol>());
  const overlayOpenRef = React.useRef(false);
  const reportOverlayOpen = React.useCallback<ToolbarOverlayContextValue>(
    (id, open) => {
      if (open) {
        openOverlayIdsRef.current.add(id);
      } else {
        openOverlayIdsRef.current.delete(id);
      }

      const nextOpen = openOverlayIdsRef.current.size > 0;

      if (overlayOpenRef.current !== nextOpen) {
        overlayOpenRef.current = nextOpen;
        onOverlayOpenChange?.(nextOpen);
      }
    },
    [onOverlayOpenChange]
  );

  return (
    <ToolbarOverlayContext.Provider value={reportOverlayOpen}>
      <ToolbarPrimitive.Root
        className={cn('relative flex select-none items-center', className)}
        {...props}
      />
    </ToolbarOverlayContext.Provider>
  );
}

// From toggleVariants
const toolbarButtonVariants = cva(
  'cn-toggle group/toggle inline-flex cursor-pointer items-center justify-center whitespace-nowrap outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'cn-toggle-size-default',
        lg: 'cn-toggle-size-lg',
        sm: 'cn-toggle-size-sm',
      },
      variant: {
        default: 'cn-toggle-variant-default',
        outline: 'cn-toggle-variant-outline',
      },
    },
  }
);

const dropdownArrowVariants = cva(
  'cn-toggle inline-flex items-center justify-center rounded-r-md text-foreground disabled:pointer-events-none disabled:opacity-50',
  {
    defaultVariants: {
      size: 'sm',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-9 w-6',
        lg: 'h-10 w-8',
        sm: 'h-8 w-4',
      },
      variant: {
        default: 'cn-toggle-variant-default',
        outline: 'cn-toggle-variant-outline border-l-0',
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
    React.ComponentProps<typeof TooltipPrimitive.Content>,
    'children'
  >;
  tooltipProps?: Omit<
    React.ComponentProps<typeof TooltipPrimitive.Root>,
    'children'
  >;
  tooltipTriggerProps?: Omit<
    React.ComponentProps<typeof TooltipPrimitive.Trigger>,
    'asChild' | 'children'
  >;
} & Omit<
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Button>,
  'asChild'
> &
  VariantProps<typeof toolbarButtonVariants>) {
  const reportOverlayOpening = useToolbarOverlayTrigger(props);

  const button = (
    <ToolbarPrimitive.Button
      className={cn(
        toolbarButtonVariants({ size, variant }),
        isDropdown && 'justify-between gap-1 pr-1',
        className
      )}
      aria-pressed={pressed}
      data-state={pressed === undefined ? undefined : pressed ? 'on' : 'off'}
      {...props}
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
      onKeyDown={(event) => {
        if (
          !props.disabled &&
          ['Enter', ' ', 'ArrowDown'].includes(event.key)
        ) {
          reportOverlayOpening();
        }

        onKeyDown?.(event);
      }}
      onPointerDown={(event) => {
        if (!props.disabled && event.button === 0 && !event.ctrlKey) {
          reportOverlayOpening();
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
    <TooltipPrimitive.Root {...tooltipProps}>
      <TooltipPrimitive.Trigger asChild {...tooltipTriggerProps}>
        {button}
      </TooltipPrimitive.Trigger>

      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={4}
          {...tooltipContentProps}
          className={cn(
            'cn-tooltip-content z-50 w-fit origin-(--radix-tooltip-content-transform-origin) bg-primary text-balance text-primary-foreground',
            tooltipContentProps?.className
          )}
        >
          {tooltip}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
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
  onPointerDown,
  size = 'sm',
  variant,
  ...props
}: Omit<
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Button>,
  'size'
> &
  VariantProps<typeof toolbarButtonVariants>) {
  const reportOverlayOpening = useToolbarOverlayTrigger(props);

  return (
    <ToolbarPrimitive.Button
      className={cn(
        toolbarButtonVariants({
          size,
          variant,
        }),
        'rounded-r-none',
        'group-data-[pressed=true]:bg-accent group-data-[pressed=true]:text-accent-foreground',
        className
      )}
      type="button"
      {...props}
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
      onKeyDown={(event) => {
        if (
          !props.disabled &&
          ['Enter', ' ', 'ArrowDown'].includes(event.key)
        ) {
          reportOverlayOpening();
        }

        onKeyDown?.(event);
      }}
      onPointerDown={(event) => {
        if (!props.disabled && event.button === 0 && !event.ctrlKey) {
          reportOverlayOpening();
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
  onPointerDown,
  size,
  variant,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Button> &
  VariantProps<typeof dropdownArrowVariants>) {
  const reportOverlayOpening = useToolbarOverlayTrigger(props);

  return (
    <ToolbarPrimitive.Button
      className={cn(
        dropdownArrowVariants({
          size,
          variant,
        }),
        'group-data-[pressed=true]:bg-accent group-data-[pressed=true]:text-accent-foreground',
        className
      )}
      type="button"
      {...props}
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
      onKeyDown={(event) => {
        if (
          !props.disabled &&
          ['Enter', ' ', 'ArrowDown'].includes(event.key)
        ) {
          reportOverlayOpening();
        }

        onKeyDown?.(event);
      }}
      onPointerDown={(event) => {
        if (!props.disabled && event.button === 0 && !event.ctrlKey) {
          reportOverlayOpening();
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
          'mb-0 shrink-0 peer-has-[[role=gridcell]]/menu-group:block peer-has-[[role=menuitem]]/menu-group:block peer-has-[[role=menuitemradio]]/menu-group:block peer-has-[[role=option]]/menu-group:block'
        )}
      />

      <div
        role="group"
        {...props}
        className={cn(
          'hidden',
          'peer/menu-group group/menu-group my-1.5 has-[[role=gridcell]]:block has-[[role=menuitem]]:block has-[[role=menuitemradio]]:block has-[[role=option]]:block',
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
