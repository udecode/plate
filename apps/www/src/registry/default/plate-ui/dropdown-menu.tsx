'use client';

import * as React from 'react';
import { useCallback, useState } from 'react';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import {
  cn,
  createPrimitiveElement,
  withCn,
  withProps,
  withRef,
  withVariants,
} from '@udecode/cn';
import { cva } from 'class-variance-authority';
import { Check, ChevronRight } from 'lucide-react';

export const DropdownMenu = DropdownMenuPrimitive.Root;

export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuGroup = React.forwardRef<
  HTMLDivElement,
  { label?: React.ReactNode } & React.ComponentPropsWithoutRef<
    typeof DropdownMenuPrimitive.Group
  >
>(({ label, ...props }, ref) => {
  return (
    <>
      <DropdownMenuSeparator
        className={cn(
          'hidden',
          'mb-0 shrink-0 peer-has-[[role=menuitem]]/menu-group:block peer-has-[[role=menuitemcheckbox]]/menu-group:block peer-has-[[role=option]]/menu-group:block'
        )}
      />

      <DropdownMenuPrimitive.Group
        ref={ref}
        {...props}
        className={cn(
          'hidden',
          'peer/menu-group group/menu-group my-1.5 has-[[role=menuitem]]:block has-[[role=menuitemcheckbox]]:block has-[[role=option]]:block',
          props.className
        )}
      >
        {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
        {props.children}
      </DropdownMenuPrimitive.Group>
    </>
  );
});

export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

export const DropdownMenuSub = DropdownMenuPrimitive.Sub;

export const DropdownMenuRadioGroup = React.forwardRef<
  HTMLDivElement,
  { label?: React.ReactNode } & React.ComponentPropsWithoutRef<
    typeof DropdownMenuPrimitive.RadioGroup
  >
>(({ label, ...props }, ref) => {
  return (
    <>
      <DropdownMenuSeparator
        className={cn(
          'hidden',
          'mb-0 shrink-0 peer-has-[[role=menuitemradio]]/menu-group:block peer-has-[[role=option]]/menu-group:block'
        )}
      />

      <DropdownMenuPrimitive.RadioGroup
        ref={ref}
        {...props}
        className={cn(
          'hidden',
          'peer/menu-group group/menu-group my-1.5 has-[[role=menuitemradio]]:block has-[[role=option]]:block',
          props.className
        )}
      >
        {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
        {props.children}
      </DropdownMenuPrimitive.RadioGroup>
    </>
  );
});

export const DropdownMenuSubTrigger = withRef<
  typeof DropdownMenuPrimitive.SubTrigger,
  {
    inset?: boolean;
  }
>(({ children, className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'mx-1 flex cursor-default items-center gap-2 rounded-sm px-2 py-1 text-sm outline-none select-none focus:bg-accent data-disabled:pointer-events-none data-disabled:opacity-50 data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      inset && 'pl-8',
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
));

export const DropdownMenuSubContent = withCn(
  DropdownMenuPrimitive.SubContent,
  'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-32 overflow-hidden rounded-md border bg-popover py-1 text-popover-foreground shadow-lg data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95'
);

const DropdownMenuContentVariants = withProps(DropdownMenuPrimitive.Content, {
  className: cn(
    'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-32 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95'
  ),
  sideOffset: 4,
});

export const DropdownMenuContent = withRef<
  typeof DropdownMenuPrimitive.Content
>(({ ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuContentVariants
      ref={ref}
      onCloseAutoFocus={(e) => {
        e.preventDefault();
      }}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));

const menuItemVariants = cva(
  'relative mx-1 flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1 text-sm transition-colors outline-none select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      inset: {
        true: 'pl-8',
      },
    },
  }
);

export const DropdownMenuItem = withVariants(
  DropdownMenuPrimitive.Item,
  menuItemVariants,
  ['inset']
);

export const DropdownMenuCheckboxItem = withRef<
  typeof DropdownMenuPrimitive.CheckboxItem
>(({ children, className, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative mx-1 flex items-center gap-2 rounded-sm py-1 pr-2 pl-8 text-sm transition-colors outline-none select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
      'cursor-pointer',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex size-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="size-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));

export const DropdownMenuRadioItem = withRef<
  typeof DropdownMenuPrimitive.RadioItem,
  {
    hideIcon?: boolean;
  }
>(({ children, className, hideIcon, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative mx-1 flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1 text-sm transition-colors outline-none select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 data-[state=checked]:text-accent-foreground [&_svg]:size-4',
      className
    )}
    {...props}
  >
    {!hideIcon && (
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
    )}
    {children}
  </DropdownMenuPrimitive.RadioItem>
));

const dropdownMenuLabelVariants = cva(
  cn(
    'mx-1 px-2 pt-1.5 pb-2 text-xs font-semibold text-muted-foreground select-none'
  ),
  {
    variants: {
      inset: {
        true: 'pl-8',
      },
    },
  }
);

export const DropdownMenuLabel = withVariants(
  DropdownMenuPrimitive.Label,
  dropdownMenuLabelVariants,
  ['inset']
);

export const DropdownMenuSeparator = withCn(
  DropdownMenuPrimitive.Separator,
  '-mx-1 my-1 h-px bg-muted'
);

export const DropdownMenuShortcut = withCn(
  createPrimitiveElement('span'),
  'ml-auto text-xs tracking-widest opacity-60'
);

export const useOpenState = () => {
  const [open, setOpen] = useState(false);

  const onOpenChange = useCallback(
    (_value = !open) => {
      setOpen(_value);
    },
    [open]
  );

  return {
    open,
    onOpenChange,
  };
};
