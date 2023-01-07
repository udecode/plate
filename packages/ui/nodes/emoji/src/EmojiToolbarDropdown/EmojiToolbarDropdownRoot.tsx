import React, { ReactNode } from 'react';
import { useDropdownControls } from '@udecode/plate-ui-toolbar';
import tw from 'twin.macro';

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
  const { styles, reference, floating } = useDropdownControls({
    open,
    onClose,
  });

  return (
    <>
      <div ref={reference} onMouseDown={onOpen}>
        {control}
      </div>

      {open && (
        <div ref={floating} css={tw`!z-20`} style={styles}>
          {children}
        </div>
      )}
    </>
  );
};
