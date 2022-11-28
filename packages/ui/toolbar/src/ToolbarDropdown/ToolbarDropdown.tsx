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
  const {
    styles,
    referenceElementRef,
    popperElementRef,
  } = useDropdownControls({ open, onClose });

  return (
    <>
      <div ref={referenceElementRef} onMouseDown={onOpen}>
        {control}
      </div>

      <div
        ref={popperElementRef}
        css={[
          tw` bg-white`,
          !open && tw`hidden`,
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
    </>
  );
};
