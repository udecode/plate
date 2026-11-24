'use client';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { CheckIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export function Picker(props: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

export function PickerTrigger({
  className,
  ...props
}: MenuPrimitive.Trigger.Props) {
  return (
    <MenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      className={cn(
        'relative w-36 shrink-0 touch-manipulation rounded-xl p-3 ring-1 ring-foreground/10 select-none hover:bg-muted focus-visible:ring-foreground/50 focus-visible:outline-none disabled:opacity-50 data-popup-open:bg-muted md:w-full md:rounded-lg md:px-2.5 md:py-2',
        className
      )}
      {...props}
    />
  );
}

export function PickerContent({
  align,
  alignOffset,
  anchor,
  className,
  side,
  ...props
}: MenuPrimitive.Popup.Props & {
  align: MenuPrimitive.Positioner.Props['align'];
  alignOffset?: MenuPrimitive.Positioner.Props['alignOffset'];
  anchor?: MenuPrimitive.Positioner.Props['anchor'];
  side: MenuPrimitive.Positioner.Props['side'];
}) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        side={side}
        sideOffset={20}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            'cn-menu-target no-scrollbar z-50 max-h-(--available-height) w-[calc(var(--available-width)-(--spacing(6)))] min-w-32 origin-(--transform-origin) translate-y-2 overflow-x-hidden overflow-y-auto rounded-xl border-0 bg-neutral-950/80 p-1.5 text-neutral-100 ring-1 ring-neutral-950/80 backdrop-blur-xl outline-none data-closed:overflow-hidden md:w-52 dark:bg-neutral-800/90 dark:ring-neutral-700/50',
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
      <div className="absolute inset-y-0 right-0 left-62 z-40 bg-transparent" />
    </MenuPrimitive.Portal>
  );
}

export function PickerGroup(props: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

export function PickerLabel({
  className,
  ...props
}: MenuPrimitive.GroupLabel.Props) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      className={cn(
        'px-2 py-1.5 text-xs font-medium text-neutral-400',
        className
      )}
      {...props}
    />
  );
}

export function PickerItem({ className, ...props }: MenuPrimitive.Item.Props) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium outline-hidden select-none **:text-neutral-100 focus:bg-neutral-600 focus:text-neutral-100 focus:**:text-neutral-100 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-neutral-700/80 pointer-coarse:gap-3 pointer-coarse:py-2.5 pointer-coarse:pl-3 pointer-coarse:text-base [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

export function PickerShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        'ml-auto text-xs tracking-widest text-neutral-400! group-focus/dropdown-menu-item:text-neutral-100',
        className
      )}
      {...props}
    />
  );
}

const PickerPreviewContext = React.createContext<
  ((value: string) => void) | null
>(null);

export function PickerRadioGroup({
  onItemPreview,
  ...props
}: Omit<MenuPrimitive.RadioGroup.Props, 'onValueChange' | 'value'> & {
  value: string;
  onItemPreview?: (value: string) => void;
  onValueChange: (value: string) => void;
}) {
  return (
    <PickerPreviewContext.Provider value={onItemPreview ?? null}>
      <MenuPrimitive.RadioGroup
        data-slot="dropdown-menu-radio-group"
        {...props}
      />
    </PickerPreviewContext.Provider>
  );
}

export function PickerRadioItem({
  children,
  className,
  onFocus,
  onMouseMove,
  value,
  ...props
}: Omit<MenuPrimitive.RadioItem.Props, 'value'> & { value: string }) {
  const onItemPreview = React.useContext(PickerPreviewContext);

  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      value={value}
      onMouseMove={(event) => {
        onMouseMove?.(event);
        onItemPreview?.(value);
      }}
      // Base UI moves DOM focus to the highlighted item, so focus covers
      // arrow-key browsing.
      onFocus={(event) => {
        onFocus?.(event);
        onItemPreview?.(value);
      }}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-lg py-1.5 pr-8 pl-2 text-sm font-medium outline-hidden select-none **:text-neutral-100 focus:bg-neutral-600 focus:text-neutral-100 focus:**:text-neutral-100 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-neutral-700/80 pointer-coarse:gap-3 pointer-coarse:py-2.5 pointer-coarse:pl-3 pointer-coarse:text-base [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon className="size-4 pointer-coarse:size-5" />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

export function PickerSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn(
        '-mx-1.5 my-1.5 h-px bg-neutral-600 dark:bg-neutral-700',
        className
      )}
      {...props}
    />
  );
}
