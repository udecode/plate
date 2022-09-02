import React from 'react';
import { withPlateEventProvider } from '@udecode/plate-core';
import { ToolbarButton } from '@udecode/plate-ui-toolbar';
import { ResolvedThreads } from '../ResolvedThreads';
import { ShowResolvedThreadsButtonProps } from './ShowResolvedThreadsButton.types';
import { useShowResolvedThreadsButton } from './useShowResolvedThreadsButton';

export const ShowResolvedThreadsButton = withPlateEventProvider(
  (props: ShowResolvedThreadsButtonProps) => {
    const {
      areThreadsShown,
      fetchContacts,
      onCloseThreads,
      onMouseDown,
      otherProps,
      ref,
      renderContainer,
      retrieveUser,
    } = useShowResolvedThreadsButton(props);
    return (
      <div ref={ref}>
        <ToolbarButton
          {...otherProps}
          active={areThreadsShown}
          onMouseDown={onMouseDown}
        />
        {areThreadsShown ? (
          <ResolvedThreads
            parent={ref}
            onClose={onCloseThreads}
            fetchContacts={fetchContacts}
            retrieveUser={retrieveUser}
            renderContainer={renderContainer}
          />
        ) : null}
      </div>
    );
  }
);
