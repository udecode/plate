import type {
  Editor,
  EditorBlockOptions,
  ElementOf,
  ValueOf,
} from '../../interfaces/index';

export const block = <N extends ElementOf<E>, E extends Editor = Editor>(
  editor: E,
  { above, highest, ...options }: EditorBlockOptions<ValueOf<E>> = {}
) => {
  if (highest) {
    const target = options.at ?? editor.selection;

    if (!target) return;

    const index = editor.api.path(target as any)?.[0];

    if (index === undefined) return;

    return editor.api.node<N>([index]);
  }
  if (above) {
    return editor.api.above<N>({
      ...(options as any),
      block: true,
    });
  }

  return editor.api.node<N>({
    ...options,
    block: true,
    mode: 'lowest',
  });
};
