import React, { ReactNode } from 'react';
import { cn } from '@udecode/plate-styled-components';
import { floatingVariants } from '../styles';
import { useDropdownControls } from './useDropdownControls';

type ToolbarDropdownProps = {
  control: ReactNode;
  open: boolean;
  children: ReactNode;
  onOpen?: () => void;
  onClose?: (ev: MouseEvent) => void;
};

export const ToolbarDropdown = ({
  control,
  children,
  open,
  onOpen,
  onClose,
}: ToolbarDropdownProps) => {
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
          className={cn(floatingVariants({ type: 'root' }))}
          style={styles}
        >
          {children}
        </div>
      )}
    </>
  );
};
