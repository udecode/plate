import {
  MarkdownPlugin,
  parseAttributes,
  convertChildrenDeserialize,
} from '@platejs/markdown';
import { KEYS, SlateEditor, getPluginType } from 'platejs';
import { useMemo } from 'react';
import { getAIReviewCommentKey } from '../utils/getAIReviewKey';

export function useAIEditorReview(previewEditor: SlateEditor, content: string) {
  previewEditor.children = useMemo(
    () => {
      return previewEditor
        .getApi(MarkdownPlugin)
        .markdown.deserialize(content, {
          rules: {
            [KEYS.comment]: {
              mark: true,
              deserialize: (mdastNode, deco, options) => {
                const props = parseAttributes(mdastNode.attributes);
                const aiCommentContent = props.value;

                return convertChildrenDeserialize(
                  mdastNode.children,
                  {
                    [getPluginType(options.editor!, KEYS.comment)]: true,
                    [getAIReviewCommentKey()]: aiCommentContent,
                    ...deco,
                  },
                  options
                ) as any;
              },
            },
          },
          memoize: true,
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [content]
  );
}
