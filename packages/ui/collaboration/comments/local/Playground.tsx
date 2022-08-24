import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AddComment, Comment } from '@styled-icons/material';
import {
  createPlugins,
  Plate,
  TEditableProps,
  withPlateEventProvider,
} from '@udecode/plate-core';
import { HeadingToolbar } from '@udecode/plate-ui-toolbar';
import { createThreadPlugin } from '@xolvio/plate-comments';
import {
  AddThreadToolbarButton,
  FetchContacts,
  OnAddThread,
  RetrieveUser,
  ToggleShowThreadsButton,
  UseCommentsReturnType,
} from '../src';
import { Comments } from './Comments';
import { useFetchContacts } from './useFetchContacts';
import { useRetrieveUser } from './useRetrieveUser';

const editableProps: TEditableProps = {
  placeholder: 'Type...',
};

const initialValue = [
  {
    type: 'p',
    children: [{ text: 'Hello World! This is a text with errors..' }],
  },
];

const Toolbar = withPlateEventProvider(
  ({
    onAddThread,
    fetchContacts,
    retrieveUser,
  }: {
    onAddThread?: OnAddThread;
    fetchContacts: FetchContacts;
    retrieveUser: RetrieveUser;
  }) => {
    return (
      <HeadingToolbar>
        <AddThreadToolbarButton
          onAddThread={onAddThread}
          icon={<AddComment />}
        />
        <ToggleShowThreadsButton
          icon={<Comment />}
          fetchContacts={fetchContacts}
          retrieveUser={retrieveUser}
          renderContainer={document.body}
        />
      </HeadingToolbar>
    );
  }
);

export const Playground = () => {
  const plugins = useMemo(() => createPlugins([createThreadPlugin()]), []);

  const [comments, setComments] = useState<UseCommentsReturnType | null>(null);
  const fetchContacts = useFetchContacts();
  const retrieveUser = useRetrieveUser();

  return (
    <DndProvider backend={HTML5Backend}>
      <Toolbar
        onAddThread={comments?.onAddThread}
        fetchContacts={fetchContacts}
        retrieveUser={retrieveUser}
      />

      <div>
        <Plate
          id="playground"
          plugins={plugins}
          editableProps={editableProps}
          initialValue={initialValue}
          onChange={console.log}
        >
          <Comments setComments={setComments} />
        </Plate>
      </div>
    </DndProvider>
  );
};
