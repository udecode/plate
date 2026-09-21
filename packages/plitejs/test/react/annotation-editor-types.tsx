import { createAnnotationStore } from 'plitejs/annotations';
import { history } from 'plitejs/history';
import {
  createEditor,
  useAnnotation,
  useAnnotationStore,
  useAnnotations,
} from 'plitejs/react';

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
createAnnotationStore(editor, [
  { anchor: { resolve: () => null }, id: 'resolve-only' },
]);

export const AnnotationTypeProbe = () => {
  const state = useAnnotationStore(editor, annotations);
  const text: string | undefined = state.getAnnotation('comment')?.data?.body;
  const annotation = useAnnotation(state, 'comment');
  const snapshot = useAnnotations(state);

  // @ts-expect-error React owns annotation-store disposal.
  state.destroy();

  return (
    <span>{text ?? annotation?.data?.body ?? snapshot.allIds[0] ?? body}</span>
  );
};

// @ts-expect-error An annotation store requires an editor runtime.
createAnnotationStore({}, annotations);
// @ts-expect-error Data inference must reject unknown annotation fields.
store.getAnnotation('comment')?.data?.missing;
