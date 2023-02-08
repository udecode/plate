import React, { useCallback } from 'react';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

type PlateCommentsShowResolvedButtonProps = ToolbarButtonProps & {
  fetchContacts: () => Promise<void>;
  renderContainer: (props: any) => JSX.Element;
  retrieveUser: () => Promise<void>;
};

export const PlateCommentsShowResolvedButton = (
  props: PlateCommentsShowResolvedButtonProps
) => {
  const {
    id,
    fetchContacts,
    renderContainer,
    retrieveUser,
    ...otherProps
  } = props;

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const isActive = Boolean(anchorEl);

  const onMouseDown = useCallback((event) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  }, []);

  return (
    <div>
      <ToolbarButton
        active={isActive}
        onMouseDown={onMouseDown}
        {...otherProps}
      />
      {/* <Popover */}
      {/*  id={isActive ? 'simple-popover' : undefined} */}
      {/*  open={isActive} */}
      {/*  anchorEl={anchorEl} */}
      {/*  onClose={handleClose} */}
      {/*  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} */}
      {/* > */}
      {/*  <PlateResolvedComments /> */}
      {/* </Popover> */}
    </div>
  );
};
