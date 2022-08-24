import React, { useCallback, useRef, useState } from 'react';
import {
  useEventPlateId,
  usePlateEditorState,
  withPlateEventProvider,
} from '@udecode/plate-core';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';
import { FetchContacts, RetrieveUser } from '../../types';
import { ResolvedThreads } from '../Threads/ResolvedThreads';

type ToggleShowThreadsButtonProps = {
  fetchContacts: FetchContacts;
  retrieveUser: RetrieveUser;
} & ToolbarButtonProps;

export const ToggleShowThreadsButton = withPlateEventProvider(
  (props: ToggleShowThreadsButtonProps) => {
    const { id, fetchContacts, retrieveUser, ...otherProps } = props;

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

    return (
      <div ref={ref}>
        <ToolbarButton
          active={areThreadsShown}
          onMouseDown={(event) => {
            if (!editor) {
              return;
            }

            event.preventDefault();
            toggleShowThreads();
          }}
          {...otherProps}
        />
        {areThreadsShown ? (
          <ResolvedThreads
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
