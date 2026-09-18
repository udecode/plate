import type { Range } from '../../../core';
import { BaseCommentsPlugin } from '../../../features/comments';
import { RangeApi, toReactPlugin } from '../../core';

/** Comment data and mapped ranges with interaction for the exact mounted view. */
export const CommentsPlugin = toReactPlugin(BaseCommentsPlugin).extend({
  api: ({ editor, api }) => ({
    begin: (at: Range | null = editor.read.selection()) =>
      !editor.read.view.isReadOnly() && api.begin(at),
  }),
  shortcuts: {
    comment: {
      keys: 'mod+shift+m',
      handler: ({ editor }) => editor.plugin(BaseCommentsPlugin).api.begin(),
    },
  },
  on: {
    click: ({ editor, event }) => {
      const commentsApi = editor.plugin(BaseCommentsPlugin).api;
      const { target } = event;
      const targetElement =
        target instanceof globalThis.Element ? target : null;
      const commentElement = targetElement?.closest('[data-comment-id]');

      if (!commentElement || !event.currentTarget.contains(commentElement)) {
        commentsApi.setActive([]);
        return;
      }

      const range = editor.api.dom.resolveEventRange(event);
      const activeAt = range ? RangeApi.start(range) : null;
      const activeIds = activeAt ? commentsApi.idsAt(activeAt) : [];

      const fallbackId = commentElement.getAttribute('data-comment-id');
      commentsApi.setActive(
        activeIds.length > 0 ? activeIds : fallbackId ? [fallbackId] : []
      );
    },
  },
});
