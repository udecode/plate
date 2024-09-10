import {
  type PluginConfig,
  type Value,
  type WithPartial,
  createTSlatePlugin,
  getNodeString,
  nanoid,
} from '@udecode/plate-common';

import type { CommentUser, TComment } from './types';

import { withComments } from './withComments';

export type CommentsConfig = PluginConfig<
  'comment',
  {
    activeCommentId: null | string;
    addingCommentId: null | string;
    comments: Record<string, TComment>;
    focusTextarea: boolean;
    myUserId: null | string;
    newValue: Value;
    onCommentAdd: ((value: WithPartial<TComment, 'userId'>) => void) | null;
    onCommentDelete: ((id: string) => void) | null;
    onCommentUpdate:
      | ((value: Partial<Omit<TComment, 'id'>> & Pick<TComment, 'id'>) => void)
      | null;
    users: Record<string, CommentUser>;
  } & CommentsSelectors,
  {
    comment: CommentsApi;
  }
>;

export type CommentsSelectors = {
  activeComment?: () => TComment | null;
  commentById?: (id: null | string) => TComment | null;
  myUser?: () => CommentUser | null;
  newText?: () => string;
  userById?: (id: null | string) => CommentUser | null;
};

export type CommentsApi = {
  addComment: (
    value: WithPartial<TComment, 'createdAt' | 'id' | 'userId'>
  ) => WithPartial<TComment, 'userId'>;
  addRawComment: (id: string) => void;
  removeComment: (id: null | string) => void;
  resetNewCommentValue: () => void;
  updateComment: (id: null | string, value: Partial<TComment>) => void;
};

export const CommentsPlugin = createTSlatePlugin<CommentsConfig>({
  extendEditor: withComments,
  key: 'comment',
  node: { isLeaf: true },
  options: {
    activeCommentId: null,
    addingCommentId: null,
    comments: {},
    focusTextarea: false,
    myUserId: null,
    newValue: [{ children: [{ text: '' }], type: 'p' }],
    onCommentAdd: null,
    onCommentDelete: null,
    onCommentUpdate: null,
    users: {},
  },
})
  .extendOptions<Partial<CommentsSelectors>>(({ getOptions }) => ({
    activeComment: () => {
      const { activeCommentId, comments } = getOptions();

      return activeCommentId ? comments[activeCommentId] : null;
    },
    commentById: (id) => {
      if (!id) return null;

      return getOptions().comments[id];
    },
    myUser: () => {
      const { myUserId, users } = getOptions();

      if (!myUserId) return null;

      return users[myUserId];
    },
    newText: () => {
      const { newValue } = getOptions();

      return getNodeString(newValue?.[0]);
    },
    userById: (id) => {
      if (!id) return null;

      return getOptions().users[id];
    },
  }))
  .extendApi<Partial<CommentsApi>>(({ getOptions, setOptions }) => ({
    addComment: (value) => {
      const { myUserId } = getOptions();
      const id = value.id ?? nanoid();
      const newComment: WithPartial<TComment, 'userId'> = {
        createdAt: Date.now(),
        id,
        userId: myUserId ?? undefined,
        ...value,
      };

      if (newComment.userId) {
        setOptions((draft) => {
          draft.comments[id] = newComment as TComment;
        });
      }

      return newComment;
    },
    addRawComment: (id) => {
      const { myUserId } = getOptions();

      if (!myUserId) return;

      setOptions((draft) => {
        draft.comments[id] = {
          id,
          userId: myUserId,
        } as TComment;
      });
    },
    removeComment: (id) => {
      if (!id) return;

      setOptions((draft) => {
        delete draft.comments[id];
      });
    },
    resetNewCommentValue: () => {
      setOptions({ newValue: [{ children: [{ text: '' }], type: 'p' }] });
    },
    updateComment: (id, value) => {
      if (!id) return;

      setOptions((draft) => {
        draft.comments[id] = { ...draft.comments[id], ...value };
      });
    },
  }));
