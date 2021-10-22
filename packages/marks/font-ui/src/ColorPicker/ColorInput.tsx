import React, { ChangeEvent, ReactElement, useRef } from 'react';
import { css } from 'twin.macro';

export interface ColorInputProps {
  value?: string;
  children?: ReactElement;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function ColorInput({ value, onChange, children }: ColorInputProps) {
  const ref = useRef<HTMLInputElement | null>(null);

  function handleClick() {
    // force click action on the input to open files selection
    ref.current?.click();
  }

  function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
    onChange && onChange(event);
  }

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        align-items: center;
      `}
    >
      {React.Children.map(children, (child) => {
        if (!child) return child;

        return React.cloneElement(child, {
          onClick: handleClick,
        });
      })}

      <input
        ref={ref}
        type="color"
        onChange={handleOnChange}
        value={value || '#000000'}
        css={css`
          width: 0px;
          height: 0px;
          padding: 0px;
          margin: 0px;
          border: 0px;
          overflow: hidden;
        `}
      />
    </div>
  );
}
