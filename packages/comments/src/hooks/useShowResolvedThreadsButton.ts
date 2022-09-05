import { useCallback, useRef, useState } from 'react';
import { useEventPlateId, usePlateEditorState } from '@udecode/plate-core';
import { ToolbarButtonProps } from '@udecode/plate-ui-toolbar';
import { Contact, User } from '../utils';

export type ShowResolvedThreadsButtonProps = {
  fetchContacts: () => Contact[];
  retrieveUser: () => User;
  renderContainer: HTMLElement;
} & ToolbarButtonProps;

export const useShowResolvedThreadsButton = (
  props: ShowResolvedThreadsButtonProps
) => {
  const {
    id,
    fetchContacts,
    renderContainer,
    retrieveUser,
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
      if (!editor) return;
      event.preventDefault();
      toggleShowThreads();
    },
    [editor, toggleShowThreads]
  );

  return {
    areThreadsShown,
    fetchContacts,
    onCloseThreads,
    onMouseDown,
    otherProps,
    ref,
    renderContainer,
    retrieveUser,
  } as const;
};
