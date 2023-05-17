import React, { ReactNode } from 'react';
import { useDropdownControls } from '@udecode/plate-ui-toolbar';

type EmojiToolbarDropdownProps = {
  control: ReactNode;
  open: boolean;
  children: ReactNode;
  onOpen?: () => void;
  onClose?: (ev: MouseEvent) => void;
};

export const EmojiToolbarDropdownRoot = ({
  control,
  children,
  open,
  onOpen,
  onClose,
}: EmojiToolbarDropdownProps) => {
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
        <div ref={refs.setFloating} className="!z-20" style={styles}>
          {children}
        </div>
      )}
    </>
  );
};
