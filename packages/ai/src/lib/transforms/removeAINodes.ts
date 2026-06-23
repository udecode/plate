import type { Path } from '@platejs/plite';
import { type BasePlateEditor, PathApi, TextApi } from 'platejs';

export const removeAINodes = (
  editor: BasePlateEditor,
  { at = [] }: { at?: Path } = {}
) => {
  const paths = editor.read((state) =>
    [
      ...state.nodes.entries({
        at,
        match: (n: unknown) =>
          TextApi.isText(n) && !!(n as Record<string, unknown>).ai,
        mode: 'lowest',
      }),
    ]
      .map(([, path]) => path)
      .sort(PathApi.compare)
      .reverse()
  );

  editor.update((tx) => {
    paths.forEach((path) => {
      tx.nodes.remove({ at: path });
    });
  });
};
