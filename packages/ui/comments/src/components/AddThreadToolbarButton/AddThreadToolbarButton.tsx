import React from 'react';
// import {
//   AddThreadToolbarButtonProps,
//   useAddThreadToolbarButton,
// } from '@udecode/plate-comments';
import { withPlateEventProvider } from '@udecode/plate-core';
// import { ToolbarButton } from '@udecode/plate-ui-toolbar';

export const AddThreadToolbarButton = withPlateEventProvider(
  (props: AddThreadToolbarButtonProps) => {
    // const { onMouseDown, otherProps } = useAddThreadToolbarButton(props);

    // return <ToolbarButton {...otherProps} onMouseDown={onMouseDown} />;
    return <div>Add thread to toolbar</div>;
  }
);
