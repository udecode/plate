import { createEditor, createEditorView } from 'platejs';
import { AuthoredPlugin } from 'platejs/authored';
import { BaseCommentsPlugin } from 'platejs/comments';

const initialValue = [{ type: 'paragraph', children: [{ text: 'Base' }] }];

const thread = {
  body: initialValue,
  id: 'thread',
  target: {
    range: {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    },
    type: 'range',
  },
} as const;

it('names the local user when the app passes none', () => {
  expect([
    createEditor({ initialValue }).userId,
    createEditor({ initialValue, userId: 'alice' }).userId,
  ]).toEqual(['local', 'alice']);
});

it('keeps the user fixed for the life of the editor and its views', () => {
  const editor = createEditor({
    initialValue,
    plugins: [AuthoredPlugin],
    userId: 'alice',
  });
  const view = createEditorView(editor);
  const attempts = [editor, view].flatMap((target) => [
    Reflect.set(target, 'userId', 'bob'),
    Reflect.defineProperty(target, 'userId', { value: 'bob' }),
    Reflect.deleteProperty(target, 'userId'),
  ]);
  editor.update.text.insert('!', { at: { offset: 4, path: [0, 0] } });

  expect({
    attempts,
    authors: editor.read.authored
      .changes()
      .items.map(({ authorId }) => authorId),
    users: [editor.userId, Reflect.get(view, 'userId')],
  }).toEqual({
    attempts: [false, false, false, false, false, false],
    authors: ['alice'],
    users: ['alice', 'alice'],
  });
});

it('names the user inside construction callbacks and the views they create', async () => {
  let inside: string | undefined;
  let view: ReturnType<typeof createEditorView> | undefined;
  createEditor({
    initialValue: ({ editor }) => {
      inside = editor.userId;
      view = createEditorView(editor);
      return initialValue;
    },
    plugins: [BaseCommentsPlugin],
    userId: 'alice',
  });
  const comments = view!.plugin(BaseCommentsPlugin).api;

  await comments.createThread(thread);

  expect([inside, comments.getThread('thread')?.userId]).toEqual([
    'alice',
    'alice',
  ]);
});

it('refuses a construction callback that redefines the user, and its views keep the editor user', async () => {
  let redefinition: unknown;
  let view: ReturnType<typeof createEditorView> | undefined;
  const editor = createEditor({
    initialValue: ({ editor: constructing }) => {
      try {
        Object.defineProperty(constructing, 'userId', {
          configurable: true,
          value: 'mallory',
          writable: true,
        });
      } catch (error) {
        redefinition = error;
      }
      view = createEditorView(constructing);
      return initialValue;
    },
    plugins: [AuthoredPlugin, BaseCommentsPlugin],
    userId: 'alice',
  });
  view!.update.text.insert('!', { at: { offset: 4, path: [0, 0] } });
  await view!.plugin(BaseCommentsPlugin).api.createThread(thread);

  expect({
    authors: editor.read.authored
      .changes()
      .items.map(({ authorId }) => authorId),
    redefined: redefinition instanceof TypeError,
    thread: editor.plugin(BaseCommentsPlugin).api.getThread('thread')?.userId,
    view: Reflect.get(view!, 'userId'),
  }).toEqual({
    authors: ['alice'],
    redefined: true,
    thread: 'alice',
    view: 'alice',
  });
});
