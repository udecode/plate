import React, { useCallback } from 'react';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

type PlateCommentsShowResolvedButtonProps = ToolbarButtonProps;

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
  const areThreadsShown = Boolean(anchorEl);

  // const handleClose = useCallback(() => {
  //   setAnchorEl(null);
  // }, []);

  const onMouseDown = useCallback((event) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  }, []);

  return (
    <div>
      <ToolbarButton
        active={areThreadsShown}
        onMouseDown={onMouseDown}
        {...otherProps}
      />
      {/* <Popover */}
      {/*  id={areThreadsShown ? 'simple-popover' : undefined} */}
      {/*  open={areThreadsShown} */}
      {/*  anchorEl={anchorEl} */}
      {/*  onClose={handleClose} */}
      {/*  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} */}
      {/* > */}
      {/*  <PlateResolvedComments /> */}
      {/* </Popover> */}
    </div>
  );
};
