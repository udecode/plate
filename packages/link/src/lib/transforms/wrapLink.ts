import type { EditorUpdateTransaction } from '@platejs/plite';

import type { BasePlateEditor, TLinkElement } from 'platejs';

import { KEYS } from 'platejs';

type WrapNodesOptions = NonNullable<
  Parameters<EditorUpdateTransaction['nodes']['wrap']>[1]
>;

export interface WrapLinkOptions extends WrapNodesOptions {
  url: string;
  target?: string;
}

/** Wrap a link node with split. */
export const wrapLink = (
  editor: BasePlateEditor,
  { target, url, ...options }: WrapLinkOptions
) => {
  editor.update((tx) => {
    tx.nodes.wrap(
      {
        children: [],
        target,
        type: editor.getType(KEYS.link),
        url,
      } satisfies TLinkElement,
      { split: true, ...options }
    );
  });
};
