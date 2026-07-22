import type { BaseEditor } from '@platejs/core';
import type {
  EditorTransactionSpecBuilder,
  Location,
  MaximizeMode,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export interface WrapLinkOptions {
  url: string;
  at?: Location;
  mode?: MaximizeMode;
  split?: boolean;
  target?: string;
  voids?: boolean;
}

/** Wrap nodes in a link. */
export const wrapLink = (
  editor: BaseEditor,
  tx: EditorTransactionSpecBuilder,
  { target, url, ...options }: WrapLinkOptions
) => {
  tx.nodes.wrap(
    {
      children: [],
      ...(target === undefined ? {} : { target }),
      type: editor.getType(KEYS.link),
      url,
    },
    { split: true, ...options }
  );
};
