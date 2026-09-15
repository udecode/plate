import { createAnnotationStore } from 'plitejs/annotations';
import { history } from 'plitejs/history';
import { createEditor, useAnnotationStore } from 'plitejs/react';

const editor = createEditor({
  plugins: [history()],
  initialValue: [{ type: 'paragraph', children: [{ text: 'typed' }] }],
});
const annotations = [
  {
    anchor: editor.anchor(
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      },
      { association: 'inward', deletion: 'drop' }
    ),
    data: { body: 'Comment' },
    id: 'comment',
  },
];
const store = createAnnotationStore(editor, annotations);
const body: string | undefined = store.getAnnotation('comment')?.data?.body;

export const AnnotationTypeProbe = () => {
  const state = useAnnotationStore(editor, annotations);
  const text: string | undefined = state.getAnnotation('comment')?.data?.body;

  return <span>{text ?? body}</span>;
};

// @ts-expect-error An annotation store requires an editor runtime.
createAnnotationStore({}, annotations);
// @ts-expect-error Data inference must reject unknown annotation fields.
store.getAnnotation('comment')?.data?.missing;
