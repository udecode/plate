import type { Text } from '@platejs/slate';

import { type SlateEditor, type TLinkElement, ElementApi, KEYS } from 'platejs';

import type { UpsertLinkOptions } from './upsertLink';

/**
 * If the text is different than the link above text, replace link children by a
 * new text. The new text has the same marks than the first text replaced.
 */
export const upsertLinkText = (
  editor: SlateEditor,
  { text }: UpsertLinkOptions
) => {
  const linkType = editor.getType(KEYS.link);
  const newLink = editor.api.above<TLinkElement>({
    match: (node) => ElementApi.isElement(node) && node.type === linkType,
  });

  if (newLink) {
    const [newLinkNode, newLinkPath] = newLink;

    if (text?.length && text !== editor.api.string(newLinkPath)) {
      const firstText = newLinkNode.children[0];

      const firstChildPath = newLinkPath.concat([0]);

      editor.update((tx) => {
        newLinkNode.children.forEach(() => {
          tx.nodes.remove({ at: firstChildPath });
        });
        tx.nodes.insert<Text>(
          { ...firstText, text },
          {
            at: firstChildPath,
            select: true,
          }
        );
      });
    }
  }
};
