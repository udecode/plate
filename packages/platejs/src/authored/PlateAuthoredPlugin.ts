import { authored } from 'plitejs/authored';

/** Native authored changes using the Plate editor's authenticated user ID. */
export const DefaultAuthoredPlugin = authored({
  authorId: (editor) => {
    const runtime = Reflect.get(editor, 'runtime');
    if (!runtime || typeof runtime !== 'object') return null;
    const userId = Reflect.get(runtime, 'userId');

    return typeof userId === 'string' && userId.length > 0 ? userId : null;
  },
});
