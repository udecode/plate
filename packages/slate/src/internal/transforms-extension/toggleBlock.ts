import type { Editor, TElement, ToggleBlockOptions } from '../../interfaces';

export const toggleBlock = (
  editor: Editor,
  type: string,
  {
    defaultType: defaultTypeProp,
    someOptions,
    wrap,
    ...options
  }: ToggleBlockOptions = {}
) => {
  const at = options.at ?? editor.selection;

  if (!at) return;

  const isActive = editor.api.some({
    at,
    ...someOptions,
    match: { type },
  });

  if (wrap) {
    if (isActive) {
      editor.tf.unwrapNodes({ at, match: { type } });
    } else {
      editor.tf.wrapNodes({ children: [], type }, { at });
    }

    return;
  }

  const defaultType = defaultTypeProp ?? editor.api.create.block().type ?? 'p';

  if (isActive && type === defaultType) return;

  editor.tf.setNodes<TElement>(
    {
      type: isActive ? defaultType : type,
    },
    { at: at as any, ...options }
  );
};
