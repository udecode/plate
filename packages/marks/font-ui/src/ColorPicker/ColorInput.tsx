import React, { ChangeEvent, useRef } from 'react';
import { css } from 'twin.macro';

export type ColorInputProps = {
  value?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function ColorInput({
  value = '#000000',
  onChange,
  children,
}: React.PropsWithChildren<ColorInputProps>) {
  const ref = useRef<HTMLInputElement | null>(null);

  function handleClick() {
    // force click action on the input to open color picker
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

        return React.cloneElement(child as React.ReactElement, {
          onClick: handleClick,
        });
      })}

      <input
        ref={ref}
        type="color"
        onChange={handleOnChange}
        value={value}
        // setting all dimensions to zero so that it won't take up any space
        // the will still trigger the browser native color picker
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
