import type { Range } from '../../../core';
import { BaseCommentsPlugin } from '../../../features/comments';
import { type Editor, RangeApi, toReactPlugin } from '../../core';
import { createAnnotationPointerHandlers } from '../../utils/annotationPointer.internal';

const commentElementAt = (event: {
  currentTarget: Element;
  target: EventTarget | null;
}) => {
  const { target } = event;
  const commentElement =
    target instanceof globalThis.Element
      ? target.closest('[data-comment-id]')
      : null;

  return commentElement && event.currentTarget.contains(commentElement)
    ? commentElement
    : null;
};

const commentIdsAt = (
  editor: Editor,
  event: { currentTarget: Element; target: EventTarget | null }
) => {
  const commentElement = commentElementAt(event);

  if (!commentElement) return [];

  const range = editor.api.dom.resolveEventRange(event);
  const activeIds = range
    ? editor.plugin(BaseCommentsPlugin).api.idsAt(RangeApi.start(range))
    : [];

  if (activeIds.length > 0) return activeIds;

  const fallbackId = commentElement.getAttribute('data-comment-id');

  return fallbackId ? [fallbackId] : [];
};

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
  on: createAnnotationPointerHandlers({
    clear: (editor) => editor.plugin(BaseCommentsPlugin).api.setActive([]),
    keyAt: (event) =>
      commentElementAt(event)?.getAttribute('data-comment-id') ?? null,
    select: ({ editor, event }) =>
      editor
        .plugin(BaseCommentsPlugin)
        .api.setActive(commentIdsAt(editor, event)),
  }),
});
