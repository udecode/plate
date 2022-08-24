import React, { useCallback, useRef, useState } from 'react';
import {
  useEventPlateId,
  usePlateEditorState,
  withPlateEventProvider,
} from '@udecode/plate-core';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';
import { FetchContacts, RetrieveUser } from '../../types';
import { ResolvedThreads } from '../Threads/ResolvedThreads';

export const ToggleShowThreadsButton = withPlateEventProvider(
  ({
    id,
    fetchContacts,
    retrieveUser,
    ...props
  }: ToolbarButtonProps & {
    fetchContacts: FetchContacts;
    retrieveUser: RetrieveUser;
  }) => {
    id = useEventPlateId(id);
    const editor = usePlateEditorState(id)!;

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
          {...props}
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
