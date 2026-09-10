import { createPliteAnnotationStore } from 'plitejs/annotations';
import { history } from 'plitejs/history';
import {
  createEditor,
  usePliteAnnotationStore,
  usePliteWidgetStore,
} from 'plitejs/react';

import { createPliteWidgetStore } from '../../src/react/widget-store';

const editor = createEditor({
  extensions: [history()],
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
const store = createPliteAnnotationStore(editor, annotations);
const body: string | undefined = store.getAnnotation('comment')?.data?.body;
const widgets = [
  {
    id: 'toolbar',
    target: { type: 'selection' as const },
    data: { label: 'Reply' },
  },
];
const widgetStore = createPliteWidgetStore(editor, () => widgets);
const label: string | undefined = widgetStore.getWidget('toolbar')?.data?.label;

export const AnnotationTypeProbe = () => {
  const state = usePliteAnnotationStore(editor, annotations);
  const text: string | undefined = state.getAnnotation('comment')?.data?.body;
  const widgetState = usePliteWidgetStore(editor, widgets);
  const widgetLabel: string | undefined =
    widgetState.getWidget('toolbar')?.data?.label;

  return (
    <span>
      {text ?? body}
      {widgetLabel ?? label}
    </span>
  );
};

// @ts-expect-error An annotation store requires an editor runtime.
createPliteAnnotationStore({}, annotations);
// @ts-expect-error Data inference must reject unknown annotation fields.
store.getAnnotation('comment')?.data?.missing;
// @ts-expect-error A widget store requires an editor runtime.
createPliteWidgetStore({}, () => widgets);
// @ts-expect-error Data inference must reject unknown widget fields.
widgetStore.getWidget('toolbar')?.data?.missing;
