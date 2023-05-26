import React, { ReactNode } from 'react';
import { useDropdownControls } from './useDropdownControls';

import { popoverVariants } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type ToolbarDropdownProps = {
  control: ReactNode;
  open: boolean;
  children: ReactNode;
  onOpen?: () => void;
  onClose?: (ev: MouseEvent) => void;
};

export function ToolbarDropdown({
  control,
  children,
  open,
  onOpen,
  onClose,
}: ToolbarDropdownProps) {
  const { styles, refs } = useDropdownControls({
    open,
    onClose,
  });

  return (
    <>
      <div ref={refs.setReference} onMouseDown={onOpen}>
        {control}
      </div>

      {open && (
        <div
          ref={refs.setFloating}
          className={cn(popoverVariants(), 'w-auto p-0')}
          style={styles}
        >
          {children}
        </div>
      )}
    </>
  );
}
