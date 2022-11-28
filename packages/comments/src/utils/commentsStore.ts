import {
  createStore,
  getNodeString,
  nanoid,
  WithRequired,
} from '@udecode/plate-core';
import { Comment, CommentUser, ReplyComment } from '../types';

export type CommentFactoryParam = WithRequired<Partial<Comment>, 'value'>;

export const commentsStore = createStore('comments')({
  /**
   * Id of the current user.
   */
  currentUserId: null as string | null,

  /**
   * Users data.
   */
  users: {} as Record<string, CommentUser>,

  /**
   * Comments data.
   */
  comments: {} as Record<string, Comment>,

  /**
   * Id of the active comment. If null, no comment is active.
   */
  activeCommentId: null as string | null,

  addingCommentId: null as string | null,

  commentFactory: (comment: CommentFactoryParam): Comment => {
    return {
      id: nanoid(),
      createdAt: Date.now(),
      userId: commentsStore.get.currentUserId() as any,
      ...comment,
    };
  },
})
  .extendSelectors((state) => ({
    comment: (id: string) => {
      return state.comments[id];
    },
    activeComment: () => {
      const id = state.activeCommentId;
      if (!id) return null;

      return state.comments[id];
    },
    currentUser: () => {
      const id = state.currentUserId;
      if (!id) return null;

      return state.users[id];
    },
    user: (id: string | null) => {
      if (!id) return null;

      return state.users[id];
    },
  }))
  .extendSelectors((state, get) => ({
    commentUser: (commentId: string) => {
      const comment = get.comment(commentId);
      if (!comment) return null;

      return state.users[comment.userId];
    },
    activeCommentUser: () => {
      const comment = get.activeComment();
      if (!comment) return null;

      return state.users[comment.userId];
    },
    commentReplies: (commentId: string) => {
      const { comments } = state;

      const replies: Record<string, ReplyComment> = {};

      Object.keys(comments).forEach((id) => {
        const comment = comments[id] as ReplyComment;
        if (comment.threadId === commentId) {
          replies[id] = comment;
        }
      });

      return replies;
    },
    commentText: (commentId: string) => {
      const comment = get.comment(commentId);

      return getNodeString(comment.value?.[0]);
    },
  }))
  .extendActions((set, get) => ({
    setComment: (id: string, value: Partial<Comment>) => {
      const comment = get.comment(id);

      set.comments({
        ...get.comments(),
        [id]: { ...comment, ...value },
      });
    },
    unsetComment: (id: string) => {
      const comment = get.comment(id);

      const comments = get.comments();
      delete comment[id];

      set.comments({
        ...comments,
      });
    },
  }));

export const useCommentsSelectors = () => commentsStore.use;
export const commentsSelectors = commentsStore.get;
export const commentsActions = commentsStore.set;
