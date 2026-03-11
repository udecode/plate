import { createEditor, PointApi } from '@platejs/slate';

const editor = createEditor();

editor.api.marks();
editor.api.point([0]);
editor.api.string([]);
editor.tf.duplicateNodes({ block: true });
editor.tf.toggleMark('bold', { remove: 'italic' });
editor.tf.reset({ children: true });
editor.tf.insertText('text');
editor.tf.select(editor.selection!);

const maybePoint = PointApi.get(editor.selection);

if (maybePoint) {
  const offset: number = maybePoint.offset;
  const path: number[] = maybePoint.path;

  void offset;
  void path;
}

// @ts-expect-error toggleMark requires a string key
editor.tf.toggleMark(true);

// @ts-expect-error duplicateNodes expects object options
editor.tf.duplicateNodes('invalid');

// @ts-expect-error non-existent api must not typecheck
editor.api.notReal();
