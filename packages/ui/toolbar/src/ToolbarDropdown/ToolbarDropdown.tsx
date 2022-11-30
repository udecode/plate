import React, { ReactNode } from 'react';
import { css } from 'styled-components';
import tw from 'twin.macro';
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
        <div
          ref={floating}
          css={[
            tw` bg-white`,
            css`
              border: 1px solid #ccc;
              box-shadow: 0 1px 3px 0 #ccc;
              z-index: 1;
            `,
          ]}
          style={styles}
        >
          {children}
        </div>
      )}
    </>
  );
};
