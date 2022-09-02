import React from 'react';
import { withPlateEventProvider } from '@udecode/plate-core';
import { ToolbarButton } from '@udecode/plate-ui-toolbar';
import { AddThreadToolbarButtonProps } from './AddThreadToolbarButton.types';
import { useAddThreadToolbarButton } from './useAddThreadToolbarButton';

export const AddThreadToolbarButton = withPlateEventProvider(
  (props: AddThreadToolbarButtonProps) => {
    const { onMouseDown, otherProps } = useAddThreadToolbarButton(props);

    return <ToolbarButton {...otherProps} onMouseDown={onMouseDown} />;
  }
);
