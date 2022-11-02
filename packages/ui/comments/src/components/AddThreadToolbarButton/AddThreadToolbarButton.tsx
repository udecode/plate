import React, { MouseEventHandler, useCallback } from 'react';
import { withPlateProvider } from '@udecode/plate-core';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

export type AddThreadToolbarButtonProps = {
  onAddThread?: () => void;
} & ToolbarButtonProps;

export const useAddThreadToolbarButton = (
  props: AddThreadToolbarButtonProps
) => {
  const { id, onAddThread, ...otherProps } = props;

  const onMouseDown = useCallback<MouseEventHandler<HTMLSpanElement>>(
    (event) => {
      event.preventDefault();
      onAddThread?.();
    },
    [onAddThread]
  );

  return { ...otherProps, onMouseDown };
};

export const AddThreadToolbarButton = withPlateProvider(
  (props: AddThreadToolbarButtonProps) => {
    const buttonProps = useAddThreadToolbarButton(props);
    return <ToolbarButton {...buttonProps} />;
  }
);
