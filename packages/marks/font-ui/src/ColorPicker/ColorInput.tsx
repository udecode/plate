import React, { ChangeEvent, useRef } from 'react';
import { getColorInputStyles } from './ColorInput.styles';

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

  const styles = getColorInputStyles();

  function handleClick() {
    // force click action on the input to open color picker
    ref.current?.click();
  }

  function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
    onChange && onChange(event);
  }

  return (
    <div css={styles.root.css}>
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
        css={styles.input?.css}
      />
    </div>
  );
}
