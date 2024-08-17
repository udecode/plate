import { createPlugin } from '../../plugin';

// TODO react
// export const EventEditorPlugin = createReactPlugin({
export const EventEditorPlugin = createPlugin({
  // handlers: {
  //   onBlur: ({ editor }) => {
  //     const focus = eventEditorSelectors.focus();
  //
  //     if (focus === editor.id) {
  //       eventEditorActions.focus(null);
  //     }
  //
  //     eventEditorActions.blur(editor.id);
  //
  //     document.dispatchEvent(
  //       new CustomEvent(BLUR_EDITOR_EVENT, {
  //         detail: { id: editor.id },
  //       })
  //     );
  //   },
  //   onFocus: ({ editor }) => {
  //     eventEditorActions.focus(editor.id);
  //
  //     document.dispatchEvent(
  //       new CustomEvent(FOCUS_EDITOR_EVENT, {
  //         detail: { id: editor.id },
  //       })
  //     );
  //   },
  // },
  key: 'eventEditor',
});
