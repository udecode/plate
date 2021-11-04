import React, { ReactNode, useEffect, useState } from 'react';
import { css } from 'styled-components';
import tw from 'twin.macro';

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
  const [
    referenceElement,
    setReferenceElement,
  ] = useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );

  useEffect(() => {
    const listener = (ev: MouseEvent) => {
      if (open) {
        if (referenceElement && ev.composedPath().includes(referenceElement)) {
          return;
        }
        if (popperElement && ev.composedPath().includes(popperElement)) {
          return;
        }

        onClose?.(ev);
      }
    };
    document.body.addEventListener('mousedown', listener);
    return () => {
      document.body.removeEventListener('mousedown', listener);
    };
  }, [onClose, open, popperElement, referenceElement]);

  return (
    <>
      <div ref={setReferenceElement} onMouseDown={onOpen}>
        {control}
      </div>

      <div
        ref={setPopperElement}
        css={[
          tw`absolute bg-white top-10`,
          !open && tw`hidden`,
          css`
            border: 1px solid #ccc;
            box-shadow: 0 1px 3px 0 #ccc;
            z-index: 1;
          `,
        ]}
      >
        {children}
      </div>
    </>
  );
};
