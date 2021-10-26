/* eslint-disable react/button-has-type */
import React from 'react';
import { getButtonStyles } from './Button.styles';
import { ButtonProps } from './Button.types';

export const Button = ({ disabled, ...props }: ButtonProps) => {
  const { root } = getButtonStyles(props);

  return (
    <button
      css={root.css}
      className={root.className}
      aria-disabled={disabled || undefined}
      type="button"
      disabled={disabled}
      {...props}
    />
  );
};
