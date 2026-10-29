'use client';

import * as React from 'react';

import {
  ContextMenu as ShadcnContextMenu,
  ContextMenuContent as ShadcnContextMenuContent,
  ContextMenuTrigger as ShadcnContextMenuTrigger,
} from '@/components/ui/context-menu';

export {
  ContextMenuCheckboxItem,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu';

type OpeningPress = {
  end: () => void;
  releasedInPlace: (event: { clientX: number; clientY: number }) => boolean;
  start: (event: { clientX: number; clientY: number }) => void;
};

// The press that opens the menu can still be down when the menu appears, and
// the menu can land under the pointer. Radix items click on a release whose
// press began elsewhere, so that press's release in place must not reach them.
const createOpeningPress = (): OpeningPress => {
  let point: { x: number; y: number } | null = null;

  return {
    end: () => {
      point = null;
    },
    releasedInPlace: (event) => {
      const start = point;
      point = null;

      return (
        !!start &&
        Math.abs(event.clientX - start.x) <= 1 &&
        Math.abs(event.clientY - start.y) <= 1
      );
    },
    start: (event) => {
      point = { x: event.clientX, y: event.clientY };
    },
  };
};

const ContextMenuDisabledContext = React.createContext(false);
const ContextMenuOpeningPressContext = React.createContext<OpeningPress | null>(
  null
);

export function ContextMenu({
  disabled = false,
  ...props
}: React.PropsWithChildren<{ disabled?: boolean; modal?: boolean }>) {
  const [openingPress] = React.useState(createOpeningPress);

  return (
    <ContextMenuDisabledContext value={disabled}>
      <ContextMenuOpeningPressContext value={openingPress}>
        <ShadcnContextMenu {...props} />
      </ContextMenuOpeningPressContext>
    </ContextMenuDisabledContext>
  );
}

export function ContextMenuContent({
  onFinalFocus,
  onPointerDownCapture,
  onPointerUpCapture,
  ...props
}: Omit<React.ComponentPropsWithoutRef<'div'>, 'onAbort'> & {
  align?: 'center' | 'end' | 'start';
  alignOffset?: number;
  onFinalFocus?: (event: Event) => void;
  side?: 'bottom' | 'left' | 'right' | 'top';
  sideOffset?: number;
}) {
  const openingPress = React.useContext(ContextMenuOpeningPressContext);

  return (
    <ShadcnContextMenuContent
      {...props}
      onCloseAutoFocus={onFinalFocus}
      onPointerDownCapture={(event) => {
        openingPress?.end();
        onPointerDownCapture?.(event);
      }}
      onPointerUpCapture={(event) => {
        if (openingPress?.releasedInPlace(event)) event.preventDefault();
        onPointerUpCapture?.(event);
      }}
    />
  );
}

export function ContextMenuTrigger({
  children,
  onContextMenu,
  ...props
}: Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> & {
  children: React.ReactElement;
}) {
  const disabled = React.useContext(ContextMenuDisabledContext);
  const openingPress = React.useContext(ContextMenuOpeningPressContext);

  return (
    <ShadcnContextMenuTrigger
      {...props}
      asChild
      disabled={disabled}
      onContextMenu={(event: React.MouseEvent<HTMLDivElement>) => {
        openingPress?.start(event);
        onContextMenu?.(event);
      }}
    >
      {children}
    </ShadcnContextMenuTrigger>
  );
}
