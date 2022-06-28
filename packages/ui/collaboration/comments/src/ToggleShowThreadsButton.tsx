import React, { useCallback, useRef, useState } from 'react';
import {
  useEventPlateId,
  usePlateEditorState,
  withPlateEventProvider,
} from '@udecode/plate-core';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';
import { Threads } from './Threads/Threads';
import { FetchContacts } from './FetchContacts';

export const ToggleShowThreadsButton = withPlateEventProvider(
  ({
    id,
    fetchContacts,
    ...props
  }: ToolbarButtonProps & {
    fetchContacts: FetchContacts;
  }) => {
    id = useEventPlateId(id);
    const editor = usePlateEditorState(id)!;

    const ref = useRef<HTMLDivElement>(null);

    const [areThreadsShown, setAreThreadsShown] = useState(false);

    const toggleShowThreads = useCallback(
      function showThreads() {
        setAreThreadsShown(!areThreadsShown);
      },
      [areThreadsShown]
    );

    const onCloseThreads = useCallback(function onCloseThreads() {
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
          <Threads
            parent={ref}
            onClose={onCloseThreads}
            fetchContacts={fetchContacts}
          />
        ) : null}
      </div>
    );
  }
);
