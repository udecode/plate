import {
  getEditorRuntimeOwner,
  getInstalledPlugin,
  getViewAuthor,
  isAuthorId,
  type RuntimeAnyEditor,
} from '../../facade';
import { DebugPlugin } from '../plugins/debug/DebugPlugin';
import type { Editor } from './Editor';

const LOCAL_USER_ID = 'local';

export const resolveEditorUserId = (userId: string | undefined) => {
  if (!userId) return LOCAL_USER_ID;
  if (!isAuthorId(userId)) {
    throw new Error(
      'createEditor({ userId }) cannot contain a NUL character, because authored changes store it as the author ID.'
    );
  }

  return userId;
};

const editorUsers = new WeakMap<object, string>();

/**
 * Fix the user of a newly allocated editor before any construction code can
 * read it or create a view, because views copy the editor's properties once.
 */
export const defineEditorUser = (editor: Editor, userId: string) => {
  editorUsers.set(editor, userId);
  Object.defineProperty(editor, 'userId', {
    enumerable: true,
    get(this: object) {
      return getViewAuthor(this) ?? userId;
    },
  });
};

const warnedEditors = new WeakSet<object>();

export const readEditorAuthor = (editor: RuntimeAnyEditor): string => {
  const viewAuthor = getViewAuthor(editor);

  if (viewAuthor !== undefined) return viewAuthor;

  const owner = getEditorRuntimeOwner(editor);
  const userId = editorUsers.get(owner);

  if (userId === undefined) {
    throw new Error('This editor has no user. Create it with createEditor.');
  }
  if (userId !== LOCAL_USER_ID) return userId;
  if (!warnedEditors.has(owner) && getInstalledPlugin(editor, 'yjs')) {
    warnedEditors.add(owner);
    editor
      .plugin(DebugPlugin)
      .api.warn(
        `This editor collaborates through Yjs as the local user, '${LOCAL_USER_ID}', which every collaborator without a userId shares. Pass createEditor({ userId }).`,
        'USER_ID_MISSING'
      );
  }

  return userId;
};
