import { useMemo } from 'react';

import {
  convertChildrenDeserialize,
  MarkdownPlugin,
  parseAttributes,
} from '@platejs/markdown';
import { type SlateEditor, getPluginType, KEYS } from 'platejs';

import { getAIReviewCommentKey } from '../utils/getAIReviewKey';

export function useAIEditorReview(previewEditor: SlateEditor, content: string) {
  previewEditor.children = useMemo(
    () => {
      return previewEditor
        .getApi(MarkdownPlugin)
        .markdown.deserialize(content, {
          memoize: true,
          rules: {
            [KEYS.comment]: {
              mark: true,
              deserialize: (mdastNode, deco, options) => {
                const props = parseAttributes(mdastNode.attributes);
                const aiCommentContent = props.value;

                return convertChildrenDeserialize(
                  mdastNode.children,
                  {
                    [getAIReviewCommentKey()]: aiCommentContent,
                    [getPluginType(options.editor!, KEYS.comment)]: true,
                    ...deco,
                  },
                  options
                ) as any;
              },
            },
          },
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [content]
  );
}
