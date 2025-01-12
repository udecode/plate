import {
  type OmitFirst,
  type PluginConfig,
  type Value,
  type WithPartial,
  NodeApi,
  bindFirst,
  createTSlatePlugin,
  nanoid,
} from '@udecode/plate';

import type { CommentUser, TComment } from './types';

import { insertComment } from './transforms/insertComment';
import { withComments } from './withComments';

export type BaseCommentsConfig = PluginConfig<
  'comment',
  {
    activeCommentId: string | null;
    addingCommentId: string | null;
    comments: Record<string, TComment>;
    focusTextarea: boolean;
    myUserId: string | null;
    newValue: Value;
    users: Record<string, CommentUser>;
    onCommentAdd: ((value: WithPartial<TComment, 'userId'>) => void) | null;
    onCommentDelete: ((id: string) => void) | null;
    onCommentUpdate:
      | ((value: Partial<Omit<TComment, 'id'>> & Pick<TComment, 'id'>) => void)
      | null;
  } & CommentsSelectors,
  {
    comment: CommentsApi;
  },
  {
    insert: {
      comment: OmitFirst<typeof insertComment>;
    };
  }
>;

export type CommentsSelectors = {
  activeComment?: () => TComment | null;
  commentById?: (id: string | null) => TComment | null;
  myUser?: () => CommentUser | null;
  newText?: () => string;
  userById?: (id: string | null) => CommentUser | null;
};

export type CommentsApi = {
  addComment: (
    value: WithPartial<TComment, 'createdAt' | 'id' | 'userId'>
  ) => WithPartial<TComment, 'userId'>;
  addRawComment: (id: string) => void;
  removeComment: (id: string | null) => void;
  resetNewCommentValue: () => void;
  updateComment: (id: string | null, value: Partial<TComment>) => void;
};

export const BaseCommentsPlugin = createTSlatePlugin<BaseCommentsConfig>({
  key: 'comment',
  node: { isLeaf: true },
  options: {
    activeCommentId: null,
    addingCommentId: null,
    comments: {},
    focusTextarea: false,
    myUserId: null,
    newValue: [{ children: [{ text: '' }], type: 'p' }],
    users: {},
    onCommentAdd: null,
    onCommentDelete: null,
    onCommentUpdate: null,
  },
  parsers: {
    html: {
      deserializer: {
        disabledDefaultNodeProps: true,
        toNodeProps: ({ element }) => {
          const { slateComment } = element.dataset;

          const ids = Object.keys(element.dataset).filter((key) =>
            /^slateComment-\d+$/.exec(key)
          );

          const node: any = {};

          if (slateComment !== undefined) {
            node.comment = Boolean(slateComment);
          }
          // parse data-slate-comment-* attributes to comment_<id>
          if (ids.length > 0) {
            ids.forEach((id) => {
              const value = element.dataset[id];

              if (value === undefined) return;

              const key = `comment_${id.replace(/^slateComment-/, '')}`;
              node[key] = Boolean(value);
            });
          }

          return node;
        },
      },
    },
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

      return NodeApi.string(newValue?.[0]);
    },
    userById: (id) => {
      if (!id) return null;

      return getOptions().users[id];
    },
  }))
  .overrideEditor(withComments)
  .extendApi<Partial<CommentsApi>>(({ getOptions, setOptions }) => ({
    addComment: (value) => {
      const { myUserId } = getOptions();
      const id = value.id ?? nanoid();
      const newComment: WithPartial<TComment, 'userId'> = {
        id,
        createdAt: Date.now(),
        userId: myUserId ?? undefined,
        ...value,
      };

      if (newComment.userId) {
        setOptions((draft) => {
          draft.comments![id] = newComment as TComment;
        });
      }

      return newComment;
    },
    addRawComment: (id) => {
      const { myUserId } = getOptions();

      if (!myUserId) return;

      setOptions((draft) => {
        draft.comments![id] = {
          id,
          userId: myUserId,
        } as TComment;
      });
    },
    removeComment: (id) => {
      if (!id) return;

      setOptions((draft) => {
        delete draft.comments![id];
      });
    },
    resetNewCommentValue: () => {
      setOptions({ newValue: [{ children: [{ text: '' }], type: 'p' }] });
    },
    updateComment: (id, value) => {
      if (!id) return;

      setOptions((draft) => {
        draft.comments![id] = { ...draft.comments![id], ...value };
      });
    },
  }))
  .extendEditorTransforms(({ editor }) => ({
    insert: { comment: bindFirst(insertComment, editor) },
  }));
