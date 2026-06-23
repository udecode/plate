import type { PlateEditor } from 'platejs/react';

export type BlocksWithIdOptions<E extends PlateEditor> = NonNullable<
  Parameters<E['api']['nodes']>[0]
>;

/** Get blocks with an id */
export const getBlocksWithId = <E extends PlateEditor>(
  editor: E,
  options: BlocksWithIdOptions<E>
) => {
  const _nodes = editor.api.nodes({
    match: (n) => editor.api.isBlock(n) && !!n.id,
    ...options,
  });

  return Array.from(_nodes);
};
