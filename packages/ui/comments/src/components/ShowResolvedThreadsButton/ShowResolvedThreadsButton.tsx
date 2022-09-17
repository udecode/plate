import React, { useCallback, useRef, useState } from 'react';
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

    const [areThreadsShown, setAreThreadsShown] = useState(false);

    const ref = useRef<HTMLDivElement>(null);

    const toggleShowThreads = useCallback(() => {
      setAreThreadsShown((areThreadsShownPrev) => !areThreadsShownPrev);
    }, []);

    const onCloseThreads = useCallback(() => {
      setAreThreadsShown(false);
    }, []);

    const onMouseDown = useCallback(
      (event) => {
        if (!editor) {
          return;
        }

        event.preventDefault();
        toggleShowThreads();
      },
      [editor, toggleShowThreads]
    );

    return (
      <div ref={ref}>
        <ToolbarButton
          active={areThreadsShown}
          onMouseDown={onMouseDown}
          {...otherProps}
        />
        {areThreadsShown ? (
          <PlateResolvedThreads
            parent={ref}
            onClose={onCloseThreads}
            fetchContacts={fetchContacts}
            retrieveUser={retrieveUser}
          />
        ) : null}
      </div>
    );
  }
);
