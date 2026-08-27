import type { Descendant, OverrideEditor, TCommentText } from 'platejs';

import { ElementApi, KEYS, TextApi } from 'platejs';

import type { BaseCommentConfig } from './BaseCommentPlugin';

import {
  getCommentCount,
  getCommentKeys,
  getDraftCommentKey,
  getTransientCommentKey,
} from './utils';

/** Drop source document comment marks so paste does not share discussion ids. */
export const stripCommentKeysFromFragment = (fragment: Descendant[]) => {
  const visit = (node: Descendant) => {
    if (TextApi.isText(node)) {
      const text = node as TCommentText;

      for (const key of getCommentKeys(text)) {
        delete text[key];
      }

      delete text[KEYS.comment];
      delete text[getDraftCommentKey()];
      delete text[getTransientCommentKey()];
    }

    if (ElementApi.isElement(node)) {
      node.children.forEach(visit);
    }
  };

  fragment.forEach(visit);
};

export const withComment: OverrideEditor<BaseCommentConfig> = ({
  editor,
  tf: { insertFragment, normalizeNode },
}) => ({
  transforms: {
    insertFragment(fragment) {
      stripCommentKeysFromFragment(fragment);
      return insertFragment(fragment);
    },
    normalizeNode(entry) {
      const [node, path] = entry;

      if (
        node[KEYS.comment] &&
        !node[getDraftCommentKey()] &&
        getCommentCount(node as TCommentText) < 1
      ) {
        editor.tf.unsetNodes(KEYS.comment, { at: path });

        return;
      }

      return normalizeNode(entry);
    },
  },
});
