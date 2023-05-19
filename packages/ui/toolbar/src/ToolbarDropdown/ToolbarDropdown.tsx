import React, { ReactNode } from 'react';
import { floatingStyles } from '../floatingStyles';
import { useDropdownControls } from './useDropdownControls';

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
          className={floatingStyles.rootVariants()}
          style={styles}
        >
          {children}
        </div>
      )}
    </>
  );
}
