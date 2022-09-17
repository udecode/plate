import React, { useCallback } from 'react';
import { Popover } from '@mui/material';
import {
  useEventPlateId,
  usePlateEditorState,
  withPlateEventProvider,
} from '@udecode/plate-core';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';
import { User } from '../../types';
import { PlateResolvedThreads } from '../ResolvedThreads/PlateResolvedThreads';

type ToggleShowThreadsButtonProps = {
  fetchContacts: () => User[];
  retrieveUser: () => User;
} & ToolbarButtonProps;

export const ToggleShowThreadsButton = withPlateEventProvider(
  (props: ToggleShowThreadsButtonProps) => {
    const {
      id,
      fetchContacts,
      renderContainer,
      retrieveUser,
      onReOpenThread,
      ...otherProps
    } = props;

    const eventPlateId = useEventPlateId(id);
    const editor = usePlateEditorState(eventPlateId)!;

    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
      null
    );
    const areThreadsShown = Boolean(anchorEl);

    const handleClose = useCallback(() => {
      setAnchorEl(null);
    }, []);

    const onMouseDown = useCallback(
      (event) => {
        if (!editor) {
          return;
        }
        event.preventDefault();
        setAnchorEl(event.currentTarget);
      },
      [editor]
    );

    return (
      <div>
        <ToolbarButton
          active={areThreadsShown}
          onMouseDown={onMouseDown}
          {...otherProps}
        />
        <Popover
          id={areThreadsShown ? 'simple-popover' : undefined}
          open={areThreadsShown}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <PlateResolvedThreads
            fetchContacts={fetchContacts}
            retrieveUser={retrieveUser}
          />
        </Popover>
      </div>
    );
  }
);
